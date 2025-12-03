import csv
import json
import re
from datetime import datetime
from collections import defaultdict

# Configuration
INPUT_FILES = {
    "APEX": "/home/ubuntu/upload/APEX.csv",
    "Fenix": "/home/ubuntu/upload/october_transactions-2025-12-03_94908.csv"
}
OUTPUT_FILE = "/home/ubuntu/apex-dashboard/client/public/data.json"

# ABECS Error Mapping
ABECS_ERRORS = {
    "ABECS-51": "Insufficient Funds",
    "ABECS-57": "Card Expired",
    "ABECS-59": "Suspected Fraud",
    "ABECS-82": "Invalid Card Data",
    "ABECS-83": "Invalid Password/PIN",
    "GEN-002": "System Error",
    "ABECS-46": "Closed Account",
    "ABECS-91": "Bank Offline"
}

def parse_date(date_str):
    """Parses date string with milliseconds and timezone."""
    try:
        if date_str.endswith("+00"):
            date_str = date_str[:-3]
        return datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S.%f")
    except ValueError:
        try:
            return datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            return None

def process_merchant(merchant_name, file_path):
    print(f"Processing {merchant_name} from {file_path}...")
    
    transactions = []
    heatmap_agg = defaultdict(lambda: defaultdict(int)) # {brand: {hour: count}}
    error_counts = defaultdict(int)
    
    # KPI Aggregators
    # Initialize with defaultdict to handle any status key (success, failed, pending, etc.)
    kpis = {
        "authorization": defaultdict(int),
        "capture": defaultdict(int),
        "zero_auth": defaultdict(int),
        "debit": defaultdict(int)
    }
    
    # Daily Data Aggregator
    daily_agg = defaultdict(lambda: {"date": "", "success": 0, "failed": 0})
    
    # Brand Data Aggregator (Type -> Brand -> Stats)
    brand_agg = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            header = next(reader)
            
            for row in reader:
                if len(row) < 15:
                    continue
                
                category = row[4] # authorization, capture, etc.
                status = row[6]   # success, failed
                created_at_str = row[12]
                transaction_data_str = row[14]
                
                dt = parse_date(created_at_str)
                if not dt:
                    continue
                
                date_key = dt.strftime("%Y-%m-%d")
                daily_agg[date_key]["date"] = date_key
                
                try:
                    t_data = json.loads(transaction_data_str)
                except json.JSONDecodeError:
                    t_data = {}

                # Determine Amount
                amount = 0.0
                if "processorReason" in t_data and "processorRaw" in t_data["processorReason"]:
                     raw = t_data["processorReason"]["processorRaw"]
                     if "Payment" in raw and "Amount" in raw["Payment"]:
                         amount = float(raw["Payment"]["Amount"]) / 100.0
                
                # Determine Brand & Type
                brand = "Unknown"
                card_type = "credit" # Default
                
                if "cardBrand" in t_data:
                    brand = t_data["cardBrand"].lower()
                elif "cardType" in t_data:
                     brand = t_data["cardType"]
                
                if "cardType" in t_data:
                    card_type = t_data["cardType"].lower()
                
                # Normalize Brand
                if "master" in brand: brand = "mastercard"
                if "visa" in brand: brand = "visa"
                if "elo" in brand: brand = "elo"
                
                # Flags
                is_zero_auth = t_data.get("isZeroAuth", False)
                is_debit = t_data.get("isDebit", False) or card_type == "debit"
                
                # Error Code
                error_code = "Unknown"
                if status == "failed":
                    if "failedReason" in t_data and "code" in t_data["failedReason"]:
                        error_code = t_data["failedReason"]["code"]
                    error_counts[error_code] += 1
                    
                    # Heatmap (Failed only)
                    hour = dt.hour
                    heatmap_agg[brand][hour] += 1
                    
                    daily_agg[date_key]["failed"] += 1
                else:
                    daily_agg[date_key]["success"] += 1

                # KPIs Update
                if is_zero_auth:
                    kpis["zero_auth"]["total"] += 1
                    kpis["zero_auth"][status] += 1
                elif is_debit:
                    kpis["debit"]["total"] += 1
                    kpis["debit"][status] += 1
                elif category == "authorization":
                    kpis["authorization"]["total"] += 1
                    kpis["authorization"][status] += 1
                elif category == "capture":
                    kpis["capture"]["total"] += 1
                    kpis["capture"][status] += 1
                
                # Brand Data Update
                # Map card_type to display categories: "Credit", "Debit", "Multiple"
                display_type = "Credit"
                if is_debit: display_type = "Debit"
                elif card_type == "multiple": display_type = "Multiple"
                
                brand_agg[display_type][brand]["total"] += 1
                brand_agg[display_type][brand][status] += 1

                # Transaction Object
                transactions.append({
                    "date": created_at_str,
                    "order_id": row[1] if len(row) > 1 else "-",
                    "category": category,
                    "status": status,
                    "external_id": row[0],
                    "amount": amount,
                    "brand": brand,
                    "error_code": error_code if status == "failed" else None
                })

    except Exception as e:
        print(f"Error processing {merchant_name}: {e}")
        return None

    # Format Heatmap Data
    heatmap_data = []
    all_brands = set(heatmap_agg.keys())
    if "visa" not in all_brands: all_brands.add("visa")
    if "mastercard" not in all_brands: all_brands.add("mastercard")

    for brand in all_brands:
        entry = {"name": brand}
        for h in range(24):
            entry[str(h)] = heatmap_agg[brand][h]
        heatmap_data.append(entry)

    # Format Error Data
    error_data = []
    total_errors = sum(error_counts.values())
    for code, count in error_counts.items():
        error_data.append({
            "code": code,
            "count": count,
            "percentage": round((count / total_errors * 100), 2) if total_errors > 0 else 0,
            "details": ABECS_ERRORS.get(code, "Unknown Error"),
            "action": "Check ABECS documentation",
            "type": "Decline"
        })
    error_data.sort(key=lambda x: x["count"], reverse=True)
    
    # Format Daily Data
    daily_data = sorted(daily_agg.values(), key=lambda x: x["date"])
    
    # Format Brand Data
    brand_data = []
    for b_type, brands in brand_agg.items():
        type_entry = {
            "type": b_type,
            "total": 0,
            "success": 0,
            "failed": 0,
            "approval_rate": 0.0,
            "brands": []
        }
        for brand_name, stats in brands.items():
            total = stats["total"]
            success = stats["success"]
            failed = stats["failed"]
            rate = (success / total * 100) if total > 0 else 0.0
            
            type_entry["total"] += total
            type_entry["success"] += success
            type_entry["failed"] += failed
            
            type_entry["brands"].append({
                "brand": brand_name,
                "total": total,
                "rate": rate
            })
        
        if type_entry["total"] > 0:
            type_entry["approval_rate"] = round((type_entry["success"] / type_entry["total"] * 100), 1)
            
        brand_data.append(type_entry)

    return {
        "kpis": kpis,
        "daily_data": daily_data,
        "brand_data": brand_data,
        "transactions": transactions,
        "heatmap_data": heatmap_data,
        "error_data": error_data,
        "heatmap_columns": [str(i) for i in range(24)]
    }

def main():
    final_data = {}
    for merchant, path in INPUT_FILES.items():
        data = process_merchant(merchant, path)
        if data:
            final_data[merchant] = data
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(final_data, f, indent=2)
    print(f"Successfully generated {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
