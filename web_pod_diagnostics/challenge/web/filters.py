from datetime import datetime

def format_date(date, *, format_str="%Y-%m-%d"):
    if not isinstance(date, datetime):
        date = datetime.strptime(date, '%Y-%m-%d')
    return date.strftime(format_str)