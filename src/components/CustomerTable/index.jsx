import React, { useEffect, useRef, useState } from "react";

import {
  IconButton,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableBody,
} from "@material-ui/core";
import { Edit, DeleteOutline } from "@material-ui/icons";

import ConfirmationModal from "../../components/ConfirmationModal";
import { useAdminContext } from "../../context/AdminContext";
import { i18n } from "../../translate/i18n";
import { useStyles } from "./style";
import { StyledTableCell, StyledTableRow } from "../../pages/StyledTable";
import TableRowSkeleton from "../TableRowSkeleton";

function CustomerTable({ handleEdit }) {
  const lastCustomer = useRef(null);
  const classes = useStyles();
  const {
    deleteCustomer,
    customerLoading,
    customers,
    hasMoreCustomers,
    setCustomersPageNumber,
  } = useAdminContext();
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deleteableCustomer, setDeleteableCustomer] = useState(null);

  const handleOpenConfirmModal = (customer) => {
    setConfirmModalOpen(true);
    setDeleteableCustomer(customer);
  };

  const handleCloseConfirmModal = () => {
    setConfirmModalOpen(false);
    setDeleteableCustomer(null);
  };

  const handleDelete = () => {
    return deleteCustomer(deleteableCustomer.id);
  };

  useEffect(() => {
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setCustomersPageNumber((prevPage) => prevPage + 1);
      }
    });
    if (lastCustomer.current) {
      intersectionObserver.observe(lastCustomer.current);
    }
    return () => intersectionObserver.disconnect();
  }, [customers]);

  return (
    <>
      <ConfirmationModal
        title={i18n.t("customerModal.confirmationModal.deleteTitle")}
        open={confirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleDelete}
      >
        {i18n.t("customerModal.confirmationModal.deleteMessage")}
      </ConfirmationModal>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <StyledTableRow>
              <StyledTableCell align="center">Nome</StyledTableCell>
              <StyledTableCell align="center">URL</StyledTableCell>
              <StyledTableCell align="center" />
            </StyledTableRow>
          </TableHead>
          <TableBody>
            <>
              {customers.map((customer, index, arr) => (
                <StyledTableRow
                  innerRef={
                    index === arr.length - 1 && hasMoreCustomers
                      ? lastCustomer
                      : undefined
                  }
                  key={customer.id}
                  className={classes.row}
                >
                  <StyledTableCell align="center">
                    {customer.name}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {customer.url}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(customer)}
                    >
                      <Edit />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={() => handleOpenConfirmModal(customer)}
                    >
                      <DeleteOutline />
                    </IconButton>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
              {customerLoading && <TableRowSkeleton columns={3} />}
            </>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export default CustomerTable;
