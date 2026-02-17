import { DataTable, DataColumn, DataRelationship } from "../types/data-model";

const BASE_URL = "http://localhost:8080/api/data";

const getHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
};

export const apiService = {
  // Tables
  getTables: async (): Promise<DataTable[]> => {
    const res = await fetch(`${BASE_URL}/tables`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to load tables");
    return res.json();
  },

  createTable: async (data: { tableName: string; description: string }) => {
    const res = await fetch(`${BASE_URL}/tables`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  syncTable: async (tableId: string) => {
    const res = await fetch(`${BASE_URL}/sync/${tableId}`, {
      method: "POST",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.text();
  },

  // Columns
  createColumn: async (tableId: string, column: DataColumn) => {
    const res = await fetch(`${BASE_URL}/table/${tableId}/column/create`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(column),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  updateColumn: async (columnId: number, column: DataColumn) => {
    const res = await fetch(`${BASE_URL}/column/${columnId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(column),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  deleteColumn: async (columnId: number) => {
    const res = await fetch(`${BASE_URL}/column/${columnId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete column");
    return true;
  },

  createRelationship: async (rel: DataRelationship) => {
    const res = await fetch(`${BASE_URL}/relationships`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(rel),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  deleteRelationship: async (id: number) => {
    const res = await fetch(`${BASE_URL}/relationships/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete relationship");
    return true;
  },
  getRelationships: async (): Promise<DataRelationship[]> => {
    const res = await fetch(`${BASE_URL}/relationships`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to load relationships");
    return res.json();
  },
};