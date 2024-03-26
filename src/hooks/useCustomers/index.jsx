import React, { useReducer, useState, useEffect } from "react";
import { toast } from "react-toastify";

import { dataReducer } from "../../reducers/data";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { i18n } from '../../translate/i18n';

function useCustomers() {
  const [customerLoading, setLoading] = useState(false);
  const [customers, dispatchCustomers] = useReducer(dataReducer, []);
  const [pageNumber, setCustomersPageNumber] = useState(1);
  const [hasMoreCustomers, setHasMore] = useState(false);

  const fetchCustomers = async () => {
    try {
      const { data } = await api.get("/customers", {
        params: { pageNumber },
      });
      setHasMore(data.hasMore);
      dispatchCustomers({ type: "LOAD_DATA", payload: data.customers });

      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  }

  const createCustomer = async (values) => {
    setLoading(true);
    const payload = {
      ...values,
      url: values.url.replace("https://", ""),
    }
    try {
      const { data } = await api.post("/customer", payload);
      toast.success(`${i18n.t("customerModal.toasts.success")}`);
      dispatchCustomers({ type: "UPDATE_DATA", payload: data.customer });
    } catch (err) {
      toastError(err);
    }
    setLoading(false);
  }

  const updateCustomer = async (values) => {
    setLoading(true);
    const payload = {
      ...values,
      url: values.url.replace("https://", ""),
    }
    try {
      const { data } = await api.put(`/customer/${payload.id}`, payload);
      toast.success(`${i18n.t("customerModal.toasts.success")}`);
      dispatchCustomers({ type: "UPDATE_DATA", payload: data.customer });
    } catch (err) {
      toastError(err);
    }
    setLoading(false);
  }

  const deleteCustomer = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/customer/${id}`);
      toast.success(`${i18n.t("customerModal.toasts.deleted")}`);
      dispatchCustomers({ type: "DELETE_DATA", payload: id });
    } catch (err) {
      toastError(err);
    }
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    fetchCustomers();
  }, [pageNumber]);

  return {
    customerLoading,
    customers,
    hasMoreCustomers,
    setCustomersPageNumber,
    createCustomer,
    updateCustomer,
    deleteCustomer
  };
}

export default useCustomers;
