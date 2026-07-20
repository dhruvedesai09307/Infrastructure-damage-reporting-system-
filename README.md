# Infrastructure-damage-reporting-system-
import customtkinter as ctk
from tkinter import messagebox

# -----------------------------
# Appearance
# -----------------------------
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

# -----------------------------
# Window
# -----------------------------
app = ctk.CTk()
app.title("Infrastructure Damage Reporting System")
app.geometry("900x550")
app.resizable(False, False)

# -----------------------------
# Login Function
# -----------------------------
def login():
    username = username_entry.get()
    password = password_entry.get()

    # Demo Credentials
    if username == "admin" and password == "1234":
        messagebox.showinfo(
            "Success",
            "Welcome to Infrastructure Damage Reporting System!"
        )
    else:
        messagebox.showerror(
            "Login Failed",
            "Invalid Username or Password!"
        )

# -----------------------------
# Show Password
# -----------------------------
def toggle_password():
    if show_var.get():
        password_entry.configure(show="")
    else:
        password_entry.configure(show="*")

# -----------------------------
# Clear
# -----------------------------
def clear():
    username_entry.delete(0, "end")
    password_entry.delete(0, "end")

# -----------------------------
# Left Panel
# -----------------------------
left = ctk.CTkFrame(
    app,
    width=350,
    corner_radius=0,
    fg_color="#0B5ED7"
)
left.pack(side="left", fill="both")

title = ctk.CTkLabel(
    left,
    text="Infrastructure\nDamage\nReporting\nSystem",
    font=("Arial", 32, "bold"),
    text_color="white",
    justify="left"
)
title.place(relx=0.08, rely=0.18)

subtitle = ctk.CTkLabel(
    left,
    text="Report road damage,\nwater leaks, broken streetlights\nand more with ease.",
    font=("Arial", 15),
    text_color="white",
    justify="left"
)
subtitle.place(relx=0.08, rely=0.62)

# -----------------------------
# Right Panel
# -----------------------------
right = ctk.CTkFrame(
    app,
    fg_color="#1A1A1A"
)
right.pack(side="right", expand=True, fill="both")

heading = ctk.CTkLabel(
    right,
    text="LOGIN",
    font=("Arial", 28, "bold")
)
heading.pack(pady=(60,20))

username_entry = ctk.CTkEntry(
    right,
    width=320,
    height=45,
    placeholder_text="Username",
    font=("Arial",16)
)
username_entry.pack(pady=10)

password_entry = ctk.CTkEntry(
    right,
    width=320,
    height=45,
    placeholder_text="Password",
    show="*",
    font=("Arial",16)
)
password_entry.pack(pady=10)

show_var = ctk.BooleanVar()

show_password = ctk.CTkCheckBox(
    right,
    text="Show Password",
    variable=show_var,
    command=toggle_password
)
show_password.pack(pady=5)

login_btn = ctk.CTkButton(
    right,
    text="Login",
    width=320,
    height=45,
    font=("Arial",18,"bold"),
    command=login
)
login_btn.pack(pady=15)

clear_btn = ctk.CTkButton(
    right,
    text="Clear",
    width=320,
    height=45,
    fg_color="#555555",
    hover_color="#777777",
    command=clear
)
clear_btn.pack()

footer = ctk.CTkLabel(
    right,
    text="© 2026 Infrastructure Damage Reporting System",
    text_color="gray"
)
footer.pack(side="bottom", pady=20)

app.mainloop()