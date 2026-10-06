package com.idrs.app;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Message;
import android.util.Log;
import android.view.View;
import android.webkit.ConsoleMessage;
import android.webkit.CookieManager;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.activity.OnBackPressedCallback;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    private static final String TAG = "IDRS_WebView";
    private static final String BASE_URL = "https://infrastructure-damage-reporting-system.onrender.com";
    private static final String START_URL = "https://infrastructure-damage-reporting-system.onrender.com/admin-login.html";

    private WebView mWebView;
    private ProgressBar mProgressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        mWebView = findViewById(R.id.webView);
        mProgressBar = findViewById(R.id.progressBar);

        configureWebViewSettings();
        configureCookieManager();
        setupWebViewClients();
        setupBackPressedHandler();

        if (savedInstanceState != null) {
            mWebView.restoreState(savedInstanceState);
        } else {
            mWebView.loadUrl(START_URL);
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void configureWebViewSettings() {
        WebSettings settings = mWebView.getSettings();

        // Core JavaScript & DOM Storage
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);

        // Window & Navigation support
        settings.setSupportMultipleWindows(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);

        // Cache & Loading
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);

        // Content Access & Security
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            // Allows HTTPS backend calls alongside assets if packaged locally
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }

        // Hardware acceleration
        mWebView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
    }

    private void configureCookieManager() {
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            cookieManager.setAcceptThirdPartyCookies(mWebView, true);
        }
        cookieManager.flush();
    }

    private void setupWebViewClients() {
        // WebViewClient to intercept URLs, handle errors, and sync cookies
        mWebView.setWebViewClient(new WebViewClient() {

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    Uri uri = request.getUrl();
                    return handleUriNavigation(view, uri);
                }
                return false;
            }

            @Override
            @SuppressWarnings("deprecation")
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                Uri uri = Uri.parse(url);
                return handleUriNavigation(view, uri);
            }

            private boolean handleUriNavigation(WebView view, Uri uri) {
                String host = uri.getHost();
                String scheme = uri.getScheme();

                // Open internal system links within the WebView
                if (host != null && (host.contains("onrender.com") || host.contains("localhost") || host.contains("127.0.0.1"))) {
                    return false; // Allow WebView to load
                }

                // Handle external intents (tel, mailto, whatsapp, maps, etc.)
                if (scheme != null && !scheme.equals("http") && !scheme.equals("https")) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                        startActivity(intent);
                        return true;
                    } catch (Exception e) {
                        Log.e(TAG, "Failed to launch external intent for scheme: " + scheme, e);
                        return true;
                    }
                }

                return false;
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                Log.d(TAG, "Page navigation started: " + url);
                if (mProgressBar != null) {
                    mProgressBar.setVisibility(View.VISIBLE);
                }
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                Log.d(TAG, "Page navigation finished: " + url);
                if (mProgressBar != null) {
                    mProgressBar.setVisibility(View.GONE);
                }
                // Flush cookies to persistent storage upon navigation completion
                CookieManager.getInstance().flush();
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    if (request.isForMainFrame()) {
                        Log.e(TAG, "Main frame error [" + error.getErrorCode() + "]: " + error.getDescription() + " for " + request.getUrl());
                        Toast.makeText(MainActivity.this, "Network Error: " + error.getDescription(), Toast.LENGTH_SHORT).show();
                    }
                }
            }

            @Override
            public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse errorResponse) {
                super.onReceivedHttpError(view, request, errorResponse);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    if (request.isForMainFrame()) {
                        int statusCode = errorResponse.getStatusCode();
                        Log.e(TAG, "HTTP error on main frame: " + statusCode + " " + errorResponse.getReasonPhrase() + " for " + request.getUrl());
                        if (statusCode >= 500) {
                            Toast.makeText(MainActivity.this, "Server is currently starting up (HTTP " + statusCode + "). Please wait...", Toast.LENGTH_SHORT).show();
                        }
                    }
                }
            }
        });

        // WebChromeClient to handle JavaScript console logs, progress, and window.open
        mWebView.setWebChromeClient(new WebChromeClient() {

            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                super.onProgressChanged(view, newProgress);
                if (mProgressBar != null) {
                    if (newProgress < 100) {
                        mProgressBar.setVisibility(View.VISIBLE);
                        mProgressBar.setProgress(newProgress);
                    } else {
                        mProgressBar.setVisibility(View.GONE);
                    }
                }
            }

            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                Log.d(TAG, "[JS " + consoleMessage.messageLevel() + "] "
                        + consoleMessage.message() + " -- From line "
                        + consoleMessage.lineNumber() + " of "
                        + consoleMessage.sourceId());
                return true;
            }

            @Override
            public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
                WebView newWebView = new WebView(MainActivity.this);
                newWebView.getSettings().setJavaScriptEnabled(true);
                newWebView.setWebViewClient(new WebViewClient() {
                    @Override
                    public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest req) {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                            view.loadUrl(req.getUrl().toString());
                        }
                        return true;
                    }
                });

                WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
                transport.setWebView(newWebView);
                resultMsg.sendToTarget();
                return true;
            }
        });
    }

    private void setupBackPressedHandler() {
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (mWebView != null && mWebView.canGoBack()) {
                    mWebView.goBack();
                } else {
                    setEnabled(false);
                    getOnBackPressedDispatcher().onBackPressed();
                }
            }
        });
    }

    @Override
    protected void onSaveInstanceState(@NonNull Bundle outState) {
        super.onSaveInstanceState(outState);
        if (mWebView != null) {
            mWebView.saveState(outState);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (mWebView != null) {
            mWebView.onResume();
        }
        CookieManager.getInstance().flush();
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (mWebView != null) {
            mWebView.onPause();
        }
        CookieManager.getInstance().flush();
    }

    @Override
    protected void onDestroy() {
        if (mWebView != null) {
            mWebView.loadUrl("about:blank");
            mWebView.clearHistory();
            mWebView.removeAllViews();
            mWebView.destroy();
            mWebView = null;
        }
        super.onDestroy();
    }
}
