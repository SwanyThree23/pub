#!/usr/bin/env python3
"""
Data Analysis MCP Server
Secure Model Context Protocol server for data analysis operations
@version 1.0.0
"""

import os
import sys
import json
import asyncio
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Any, Dict, List, Optional
from cryptography.fernet import Fernet

# MCP SDK imports
try:
    from mcp.server import Server, NotificationOptions
    from mcp.server.models import InitializationOptions
    from mcp.server.stdio import stdio_server
    from mcp.types import (
        Tool,
        TextContent,
        CallToolResult,
        ErrorData,
    )
except ImportError:
    print("Error: MCP SDK not installed. Install with: pip install mcp", file=sys.stderr)
    sys.exit(1)

# Configuration
DATA_STORAGE_PATH = os.getenv("DATA_STORAGE_PATH", "./data")
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")

# Initialize encryption
cipher_suite = None
if ENCRYPTION_KEY:
    cipher_suite = Fernet(ENCRYPTION_KEY.encode())

# Initialize server
server = Server("data-analysis-server")


class SecureDataAnalyzer:
    """Secure data analysis operations"""

    def __init__(self, storage_path: str):
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)

    def encrypt_data(self, data: str) -> str:
        """Encrypt sensitive data"""
        if cipher_suite:
            return cipher_suite.encrypt(data.encode()).decode()
        return data

    def decrypt_data(self, encrypted_data: str) -> str:
        """Decrypt sensitive data"""
        if cipher_suite:
            return cipher_suite.decrypt(encrypted_data.encode()).decode()
        return encrypted_data

    def load_dataframe(self, filename: str, encrypted: bool = False) -> pd.DataFrame:
        """Load DataFrame from file"""
        filepath = self.storage_path / filename

        if not filepath.exists():
            raise FileNotFoundError(f"File not found: {filename}")

        # Read file content
        with open(filepath, "r") as f:
            content = f.read()

        # Decrypt if necessary
        if encrypted:
            content = self.decrypt_data(content)

        # Parse based on file extension
        if filename.endswith(".csv"):
            from io import StringIO
            return pd.read_csv(StringIO(content))
        elif filename.endswith(".json"):
            return pd.read_json(content)
        else:
            raise ValueError(f"Unsupported file format: {filename}")

    def save_dataframe(
        self, df: pd.DataFrame, filename: str, encrypted: bool = False
    ) -> str:
        """Save DataFrame to file"""
        filepath = self.storage_path / filename

        # Convert to string
        if filename.endswith(".csv"):
            content = df.to_csv(index=False)
        elif filename.endswith(".json"):
            content = df.to_json(orient="records", indent=2)
        else:
            raise ValueError(f"Unsupported file format: {filename}")

        # Encrypt if necessary
        if encrypted:
            content = self.encrypt_data(content)

        # Write to file
        with open(filepath, "w") as f:
            f.write(content)

        return str(filepath)

    def analyze_dataframe(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Perform basic analysis on DataFrame"""
        analysis = {
            "shape": df.shape,
            "columns": df.columns.tolist(),
            "dtypes": df.dtypes.astype(str).to_dict(),
            "missing_values": df.isnull().sum().to_dict(),
            "summary_statistics": df.describe().to_dict(),
            "memory_usage": df.memory_usage(deep=True).to_dict(),
        }

        return analysis

    def filter_dataframe(
        self, df: pd.DataFrame, conditions: Dict[str, Any]
    ) -> pd.DataFrame:
        """Filter DataFrame based on conditions"""
        filtered_df = df.copy()

        for column, condition in conditions.items():
            if column not in df.columns:
                continue

            operator = condition.get("operator", "==")
            value = condition.get("value")

            if operator == "==":
                filtered_df = filtered_df[filtered_df[column] == value]
            elif operator == "!=":
                filtered_df = filtered_df[filtered_df[column] != value]
            elif operator == ">":
                filtered_df = filtered_df[filtered_df[column] > value]
            elif operator == "<":
                filtered_df = filtered_df[filtered_df[column] < value]
            elif operator == ">=":
                filtered_df = filtered_df[filtered_df[column] >= value]
            elif operator == "<=":
                filtered_df = filtered_df[filtered_df[column] <= value]
            elif operator == "contains":
                filtered_df = filtered_df[filtered_df[column].str.contains(value, na=False)]
            elif operator == "in":
                filtered_df = filtered_df[filtered_df[column].isin(value)]

        return filtered_df

    def aggregate_dataframe(
        self, df: pd.DataFrame, group_by: List[str], aggregations: Dict[str, str]
    ) -> pd.DataFrame:
        """Aggregate DataFrame"""
        if not group_by:
            raise ValueError("group_by must contain at least one column")

        agg_df = df.groupby(group_by).agg(aggregations).reset_index()
        return agg_df

    def compute_statistics(
        self, df: pd.DataFrame, column: str, operations: List[str]
    ) -> Dict[str, float]:
        """Compute statistical operations on a column"""
        if column not in df.columns:
            raise ValueError(f"Column not found: {column}")

        results = {}
        series = df[column]

        for op in operations:
            if op == "mean":
                results["mean"] = float(series.mean())
            elif op == "median":
                results["median"] = float(series.median())
            elif op == "std":
                results["std"] = float(series.std())
            elif op == "var":
                results["var"] = float(series.var())
            elif op == "min":
                results["min"] = float(series.min())
            elif op == "max":
                results["max"] = float(series.max())
            elif op == "sum":
                results["sum"] = float(series.sum())
            elif op == "count":
                results["count"] = int(series.count())
            elif op == "nunique":
                results["nunique"] = int(series.nunique())

        return results


# Initialize analyzer
analyzer = SecureDataAnalyzer(DATA_STORAGE_PATH)


@server.list_tools()
async def handle_list_tools() -> List[Tool]:
    """List available data analysis tools"""
    return [
        Tool(
            name="load_data",
            description="Load data from a file (CSV or JSON)",
            inputSchema={
                "type": "object",
                "properties": {
                    "filename": {
                        "type": "string",
                        "description": "Name of the file to load",
                    },
                    "encrypted": {
                        "type": "boolean",
                        "description": "Whether the file is encrypted",
                        "default": False,
                    },
                },
                "required": ["filename"],
            },
        ),
        Tool(
            name="analyze_data",
            description="Perform comprehensive analysis on loaded data",
            inputSchema={
                "type": "object",
                "properties": {
                    "filename": {
                        "type": "string",
                        "description": "Name of the file to analyze",
                    },
                },
                "required": ["filename"],
            },
        ),
        Tool(
            name="filter_data",
            description="Filter data based on conditions",
            inputSchema={
                "type": "object",
                "properties": {
                    "filename": {
                        "type": "string",
                        "description": "Name of the file to filter",
                    },
                    "conditions": {
                        "type": "object",
                        "description": "Filter conditions (column: {operator, value})",
                    },
                    "output_filename": {
                        "type": "string",
                        "description": "Name for the filtered output file",
                    },
                },
                "required": ["filename", "conditions"],
            },
        ),
        Tool(
            name="aggregate_data",
            description="Aggregate data with grouping and aggregation functions",
            inputSchema={
                "type": "object",
                "properties": {
                    "filename": {
                        "type": "string",
                        "description": "Name of the file to aggregate",
                    },
                    "group_by": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Columns to group by",
                    },
                    "aggregations": {
                        "type": "object",
                        "description": "Aggregation functions (column: function)",
                    },
                    "output_filename": {
                        "type": "string",
                        "description": "Name for the aggregated output file",
                    },
                },
                "required": ["filename", "group_by", "aggregations"],
            },
        ),
        Tool(
            name="compute_statistics",
            description="Compute statistical operations on a specific column",
            inputSchema={
                "type": "object",
                "properties": {
                    "filename": {
                        "type": "string",
                        "description": "Name of the file",
                    },
                    "column": {
                        "type": "string",
                        "description": "Column name to analyze",
                    },
                    "operations": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Statistical operations (mean, median, std, etc.)",
                    },
                },
                "required": ["filename", "column", "operations"],
            },
        ),
        Tool(
            name="save_data",
            description="Save processed data to a file",
            inputSchema={
                "type": "object",
                "properties": {
                    "data": {
                        "type": "string",
                        "description": "JSON string of data to save",
                    },
                    "filename": {
                        "type": "string",
                        "description": "Output filename",
                    },
                    "encrypted": {
                        "type": "boolean",
                        "description": "Whether to encrypt the file",
                        "default": False,
                    },
                },
                "required": ["data", "filename"],
            },
        ),
    ]


@server.call_tool()
async def handle_call_tool(name: str, arguments: Dict[str, Any]) -> List[TextContent]:
    """Handle tool execution"""
    try:
        if name == "load_data":
            filename = arguments["filename"]
            encrypted = arguments.get("encrypted", False)

            df = analyzer.load_dataframe(filename, encrypted)

            result = {
                "success": True,
                "filename": filename,
                "shape": df.shape,
                "columns": df.columns.tolist(),
                "preview": df.head(10).to_dict(orient="records"),
            }

            return [TextContent(type="text", text=json.dumps(result, indent=2))]

        elif name == "analyze_data":
            filename = arguments["filename"]
            df = analyzer.load_dataframe(filename)
            analysis = analyzer.analyze_dataframe(df)

            result = {
                "success": True,
                "filename": filename,
                "analysis": analysis,
            }

            return [TextContent(type="text", text=json.dumps(result, indent=2, default=str))]

        elif name == "filter_data":
            filename = arguments["filename"]
            conditions = arguments["conditions"]
            output_filename = arguments.get("output_filename")

            df = analyzer.load_dataframe(filename)
            filtered_df = analyzer.filter_dataframe(df, conditions)

            result = {
                "success": True,
                "original_rows": len(df),
                "filtered_rows": len(filtered_df),
                "preview": filtered_df.head(10).to_dict(orient="records"),
            }

            if output_filename:
                filepath = analyzer.save_dataframe(filtered_df, output_filename)
                result["saved_to"] = filepath

            return [TextContent(type="text", text=json.dumps(result, indent=2))]

        elif name == "aggregate_data":
            filename = arguments["filename"]
            group_by = arguments["group_by"]
            aggregations = arguments["aggregations"]
            output_filename = arguments.get("output_filename")

            df = analyzer.load_dataframe(filename)
            agg_df = analyzer.aggregate_dataframe(df, group_by, aggregations)

            result = {
                "success": True,
                "aggregated_rows": len(agg_df),
                "preview": agg_df.to_dict(orient="records"),
            }

            if output_filename:
                filepath = analyzer.save_dataframe(agg_df, output_filename)
                result["saved_to"] = filepath

            return [TextContent(type="text", text=json.dumps(result, indent=2))]

        elif name == "compute_statistics":
            filename = arguments["filename"]
            column = arguments["column"]
            operations = arguments["operations"]

            df = analyzer.load_dataframe(filename)
            stats = analyzer.compute_statistics(df, column, operations)

            result = {
                "success": True,
                "column": column,
                "statistics": stats,
            }

            return [TextContent(type="text", text=json.dumps(result, indent=2))]

        elif name == "save_data":
            data_str = arguments["data"]
            filename = arguments["filename"]
            encrypted = arguments.get("encrypted", False)

            # Parse JSON string to DataFrame
            data = json.loads(data_str)
            df = pd.DataFrame(data)

            filepath = analyzer.save_dataframe(df, filename, encrypted)

            result = {
                "success": True,
                "saved_to": filepath,
                "rows": len(df),
            }

            return [TextContent(type="text", text=json.dumps(result, indent=2))]

        else:
            raise ValueError(f"Unknown tool: {name}")

    except Exception as e:
        error_result = {
            "error": True,
            "message": str(e),
            "tool": name,
        }
        return [TextContent(type="text", text=json.dumps(error_result, indent=2))]


async def main():
    """Run the MCP server"""
    async with stdio_server() as (read_stream, write_stream):
        init_options = InitializationOptions(
            server_name="data-analysis-server",
            server_version="1.0.0",
            capabilities=server.get_capabilities(
                notification_options=NotificationOptions(),
                experimental_capabilities={},
            ),
        )

        await server.run(
            read_stream,
            write_stream,
            init_options,
        )


if __name__ == "__main__":
    asyncio.run(main())
