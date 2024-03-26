import React from "react";

import { makeStyles } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";
import { StyledTableCell, StyledTableRow } from "../../pages/StyledTable";

const useStyles = makeStyles((theme) => ({
  customStyledTableCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const TableRowSkeleton = ({ avatar, columns, emptyColumnIndex }) => {
  const classes = useStyles();
  return (
    <StyledTableRow>
      {avatar && (
        <>
          <StyledTableCell style={{ paddingRight: 0 }}>
            <Skeleton
              animation="wave"
              variant="circle"
              width={40}
              height={40}
            />
          </StyledTableCell>
          <StyledTableCell>
            <Skeleton animation="wave" height={30} width={80} />
          </StyledTableCell>
        </>
      )}
      {Array.from({ length: columns }, (_, index) => (
        <StyledTableCell
          padding={index === emptyColumnIndex ? "none" : undefined}
          style={index === emptyColumnIndex ? { width: 0 } : undefined}
          align="center"
          key={index}
        >
          <div className={classes.customStyledTableCell}>
            <Skeleton
              align="center"
              animation="wave"
              height={index !== emptyColumnIndex ? 30 : 0}
              width={index !== emptyColumnIndex ? "100%" : 0}
            />
          </div>
        </StyledTableCell>
      ))}
    </StyledTableRow>
  );
};

export default TableRowSkeleton;
