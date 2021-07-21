from flask import Blueprint, jsonify

from flask_login import login_required
from app.models import User, db, Company
import requests
import os

apikey = os.environ.get('API_FIN_PUBLIC')
apikey2 = os.environ.get('API_2_FIN')

stock_routes = Blueprint('stocks', __name__)


@stock_routes.route('/justinpage/<path:ticker>')
# @login_required
def stock(ticker):
    print("ticker reached:", ticker)
    res = requests.get(
        f'https://cloud.iexapis.com/stable/stock/{ticker}/quote?token={apikey}')
    return res.json()


@stock_routes.route('/2')
# @login_required
def stock2():
    res = requests.get(
        f'https://financialmodelingprep.com/api/v3/historical-chart/15min/AAPL?apikey={apikey2}')
    print(res.json())
    return res.json()


@stock_routes.route('/')
def stocks():
    return {"Hello"}


# @stock_routes.route('/<int:id>')
# def stock(id):