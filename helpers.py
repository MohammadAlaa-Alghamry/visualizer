import os
import requests
import urllib.parse

from flask import redirect, render_template, request, session
from functools import wraps


def apology(message, code=400):
    """Render message as an apology to user."""
    def escape(s):
        """
        Escape special characters.

        https://github.com/jacebrowning/memegen#special-characters
        """
        for old, new in [("-", "--"), (" ", "-"), ("_", "__"), ("?", "~q"),
                         ("%", "~p"), ("#", "~h"), ("/", "~s"), ("\"", "''")]:
            s = s.replace(old, new)
        return s
    return render_template("apology.html", top=code, bottom=escape(message)), code


def login_required(f):
    """
    Decorate routes to require login.

    http://flask.pocoo.org/docs/1.0/patterns/viewdecorators/
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return redirect("/login")
        return f(*args, **kwargs)
    return decorated_function


def usd(value):
    """Format value as USD."""
    return f"${value:,.2f}"


def format_no_symbol(value):
    """Format value as USD."""
    return f"{value:,.2f}"
    

def format_lists(acc_lists):
    line_list = []
    for _list in acc_lists:
        line_list = _list
        # check for numerical values and change them to float
        for i in range(len(line_list)):
            # check the items of the list for numbers
            if line_list[i].isdigit() or line_list[i].replace('.', '', 1).isdigit():
                line_list[i] = format_no_symbol(float(line_list[i]))
            else:
                pass

def list_acc(filename):
    
    import csv

    dict_list = []

    # read data from file
    with open(filename, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            # print("@rows:", row)
            for item in row.items():
                # print("@items:", item)
                # check for numerical values and change them to float
                if item[1].isdigit() or item[1].replace('.', '', 1).isdigit():
                    row[item[0]] = float(item[1])
            dict_list.append(row)
    
    # print("dict_list:", dict_list)
   
    return dict_list
