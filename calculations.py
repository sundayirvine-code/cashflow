from datetime import datetime, date, timedelta
from decimal import Decimal, ROUND_HALF_UP

def calculate_total_income_between_dates(user_id, start_date=None, end_date=None):
    """
    Calculate the total income for a user between specified dates.

    Args:
        user_id (int): The user's ID.
        start_date (date, optional): The start date of the range.
        end_date (date, optional): The end date of the range.

    Returns:
        tuple: A tuple containing total income amount and a list of individual income transactions.
                Each individual transaction is represented as a dictionary with keys: 'amount', 'date', 'name', 'income_type'.

    """
    from models import CashIn, Income, IncomeType, db

    if start_date is None:
        start_date = date(datetime.now().year, datetime.now().month, 1)
    if end_date is None:
        end_date = date.today()

    cash_incomes = CashIn.query.filter(
        CashIn.user_id == user_id,
        CashIn.date >= start_date,
        CashIn.date <= end_date
    ).all()

    total_income = 0
    individual_incomes = []

    for cash_in in cash_incomes:
        income = db.session.get(Income, cash_in.income_id)
        income_type = db.session.get(IncomeType, income.income_type_id)
        total_income += cash_in.amount
        individual_incomes.append({
            'amount': cash_in.amount,
            'date': cash_in.date,
            'name': income.name,
            'description': cash_in.description,
            'id': cash_in.id,
            'income_type': income_type.name
        })
    
    total_income = Decimal(total_income).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    return total_income, individual_incomes

def calculate_total_expenses_between_dates(user_id, start_date=None, end_date=None):
    """
    Calculate the total expenses for a user between specified dates.

    Args:
        user_id (int): The user's ID.
        start_date (date, optional): The start date of the range.
        end_date (date, optional): The end date of the range.

    Returns:
        tuple: A tuple containing total expenses amount and a list of individual expense transactions.
                Each individual transaction is represented as a dictionary with keys: 'amount', 'date', 'name'.

    """
    from models import CashOut, Expense, db

    if start_date is None:
        start_date = date(datetime.now().year, datetime.now().month, 1)
    if end_date is None:
        end_date = date.today()

    cash_outflows = CashOut.query.filter(
        CashOut.user_id == user_id,
        CashOut.date >= start_date,
        CashOut.date <= end_date
    ).all()

    total_expenses = 0
    individual_expenses = []

    for cash_out in cash_outflows:
        expense = db.session.get(Expense, cash_out.expense_id)
        total_expenses += cash_out.amount
        individual_expenses.append({
            'amount': cash_out.amount,
            'date': cash_out.date,
            'name': expense.name,
            'description': cash_out.description,
            'id': cash_out.id, 
        })

    total_expenses = Decimal(total_expenses).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    return total_expenses, individual_expenses

def calculate_total_income(user_id):
    """
    Calculate the total income for a user.

    Args:
        user_id (int): The user's ID.

    Returns:
        float: The total income amount for the user.

    """
    from models import CashIn

    incomes = CashIn.query.filter_by(user_id=user_id).all()
    total_income = sum(income.amount for income in incomes)
    return total_income

def calculate_total_expenses(user_id):
    """
    Calculate the total expenses for a user.

    Args:
        user_id (int): The user's ID.

    Returns:
        float: The total expenses amount for the user.

    """
    from models import CashOut

    expenses = CashOut.query.filter_by(user_id=user_id).all()
    total_expenses = sum(expense.amount for expense in expenses)
    return total_expenses