from flask import Flask, render_template, request
import csv
import os

app = Flask(__name__)

# Hardcoded dictionary for stock prices
STOCK_PRICES = {
    "AAPL": 180.0,
    "TSLA": 250.0,
    "MSFT": 330.0,
    "GOOGL": 140.0,
    "AMZN": 135.0,
    "META": 300.0,
    "NVDA": 450.0
}

@app.route("/", methods=["GET", "POST"])
def index():
    total_investment = None
    error_message = None
    result = None
    
    if request.method == "POST":
        stock_name = request.form.get("stock_name", "").strip().upper()
        
        try:
            quantity = float(request.form.get("quantity", 0))
            if quantity <= 0:
                error_message = "Quantity must be greater than zero."
            elif stock_name not in STOCK_PRICES:
                error_message = f"Stock '{stock_name}' not found. Available stocks: {', '.join(STOCK_PRICES.keys())}"
            else:
                price = STOCK_PRICES[stock_name]
                total_investment = price * quantity
                
                # Save to CSV
                save_to_csv(stock_name, price, quantity, total_investment)
                
                result = {
                    "name": stock_name,
                    "price": price,
                    "quantity": quantity,
                    "total": total_investment
                }
        except ValueError:
            error_message = "Invalid quantity entered."
            
    return render_template("index.html", 
                           stocks=STOCK_PRICES, 
                           result=result, 
                           error=error_message)

def save_to_csv(name, price, quantity, total):
    file_exists = os.path.isfile("portfolio.csv")
    with open("portfolio.csv", "a", newline="") as csvfile:
        fieldnames = ["Stock", "Price", "Quantity", "Total Value"]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        if not file_exists:
            writer.writeheader()
            
        writer.writerow({
            "Stock": name,
            "Price": f"${price:.2f}",
            "Quantity": quantity,
            "Total Value": f"${total:.2f}"
        })

if __name__ == "__main__":
    app.run(debug=True, port=5000)
