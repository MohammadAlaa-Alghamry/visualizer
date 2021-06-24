from cloudant import Cloudant
import atexit

import os
import sqlite3

from flask import Flask, flash, jsonify, redirect, render_template, request, session, Response, json
from flask_session import Session
from tempfile import mkdtemp
from werkzeug.exceptions import default_exceptions, HTTPException, InternalServerError
from werkzeug.security import check_password_hash, generate_password_hash

from datetime import datetime as dt

from helpers import apology, login_required, usd, list_acc

# IBM Configuration
# Configure application
# Configure Environment
app = Flask(__name__, static_url_path='')

db_name = 'mydb'
client = None
db = None

if 'VCAP_SERVICES' in os.environ:
    vcap = json.loads(os.getenv('VCAP_SERVICES'))
    print('Found VCAP_SERVICES')
    if 'cloudantNoSQLDB' in vcap:
        creds = vcap['cloudantNoSQLDB'][0]['credentials']
        user = creds['username']
        password = creds['password']
        url = 'https://' + creds['host']
        client = Cloudant(user, password, url=url, connect=True)
        db = client.create_database(db_name, throw_on_exists=False)
elif "CLOUDANT_URL" in os.environ:
    client = Cloudant(os.environ['CLOUDANT_USERNAME'], os.environ['CLOUDANT_PASSWORD'], url=os.environ['CLOUDANT_URL'], connect=True)
    db = client.create_database(db_name, throw_on_exists=False)
elif os.path.isfile('vcap-local.json'):
    with open('vcap-local.json') as f:
        vcap = json.load(f)
        print('Found local VCAP_SERVICES')
        creds = vcap['services']['cloudantNoSQLDB'][0]['credentials']
        user = creds['username']
        password = creds['password']
        url = 'https://' + creds['host']
        client = Cloudant(user, password, url=url, connect=True)
        db = client.create_database(db_name, throw_on_exists=False)


# On IBM Cloud Cloud Foundry, get the port number from the environment variable PORT
# When running this app on the local machine, default the port to 8000
port = int(os.getenv('PORT', 8000))





# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Ensure responses aren't cached
@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


# Custom filter
app.jinja_env.filters["usd"] = usd

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_FILE_DIR"] = mkdtemp()
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# set a connection to the database
db_conn = sqlite3.connect('finance.db')

# set path to files
path = 'data/'

@app.route("/")
@login_required
def index():
    """Show portfolio of stocks"""

    return render_template("index.html")


@app.route("/check", methods=["GET"])
def check():
    """Return true if username available, else false, in JSON format"""

    # extract username from request
    username = request.args.get("username")

    # check username validity
    if username:
        if len(username) > 0:

            # prepare database
            conn = sqlite3.connect("finance.db")
            cur = conn.cursor()

            # query for the passed username
            cur.execute("SELECT username FROM users WHERE username=?", (username,))
            query_value = cur.fetchone()

            # check if query returned anything
            if query_value == None:
                return jsonify(True)


            elif query_value[0] == username:
                return jsonify(False)
    else:
        return jsonify("false")


@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""

    # Forget any user_id
    session.clear()

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        # Ensure username was submitted
        if not request.form.get("username"):
            return apology("must provide username", 403)

        # Ensure password was submitted
        elif not request.form.get("password"):
            return apology("must provide password", 403)

        # Query database for username
        
        # prepare the database for query
        conn = sqlite3.connect('users.db')
        conn.row_factory = sqlite3.Row # <-- essential for the db.execute to return a Row (i.e: Dict)
        db = conn.cursor()
        
        # iterate over database cursor to get all output rows of execute function
        rows = []
        for row in db.execute("SELECT * FROM users WHERE username = :username", {'username': request.form.get("username")}):
            rows.append(dict(row))

        # Ensure username exists and password is correct
        if len(rows) != 1 or not (rows[0]["hash"] == request.form.get("password")):
            return render_template("login.html", msg="Invalid Username or Password")
            # return apology("invalid username and/or password", 403)
        print("Debugging:", rows[0]["hash"])

        # if len(rows) != 1 or not check_password_hash(rows[0]["hash"], request.form.get("password")):
        #     return apology("invalid username and/or password", 403)

        # Close the db
        db.close()

        # Remember which user has logged in
        session["user_id"] = rows[0]["id"]

        # Redirect user to home page
        return redirect("/")

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("login.html")


@app.route("/logout")
def logout():
    """Log user out"""

    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return redirect("/")


@app.route("/balances")
@login_required
def balances():

    filename = path + "balances_test.csv"
    acc_dicts_list = list_acc(filename)
    
    return render_template("balances.html", xvalues=acc_dicts_list)

@app.route("/owners")
@login_required
def owners():

    filename = path + "owners_test.csv"
    acc_dicts_list = list_acc(filename)
    
    return render_template("owners.html", xvalues=acc_dicts_list)


@app.route("/agents")
# @login_required
def agents():

    filename = path + "agents_test.csv"
    acc_dicts_list = list_acc(filename)

    return render_template("agents.html", xvalues=acc_dicts_list)


@app.route("/expenses")
def expenses():

    filename = path + "expenses_test.csv"
    acc_dicts_list = list_acc(filename)

    
    return render_template("expenses.html", xvalues=acc_dicts_list)


@app.route("/employees")
def employees():

    filename = path + "employees_test.csv"
    acc_dicts_list = list_acc(filename)
    
    return render_template("employees.html", xvalues=acc_dicts_list)


@app.route("/all_acc")
@login_required
def all_acc():

    filename = path + "all_accounts_test.csv"
    acc_dicts_list = list_acc(filename)
    
    return render_template("all_acc.html", xvalues=acc_dicts_list)


def errorhandler(e):
    """Handle error"""
    if not isinstance(e, HTTPException):
        e = InternalServerError()
    return apology(e.name, e.code)


# Listen for errors
for code in default_exceptions:
    app.errorhandler(code)(errorhandler)



# run application
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port, debug=True)
Type  :qa  and press <Enter> to exit Vim