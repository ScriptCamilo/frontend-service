import React, { useState } from "react";
import Chip from "@material-ui/core/Chip";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import DoneIcon from "@material-ui/icons/Done";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  chip: {
    margin: theme.spacing(0.5),
  },
}));

const EditableChip = ({ initialValue, onDelete, onUpdate }) => {
  const classes = useStyles();
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = () => {
    setIsEditing(false);
    onUpdate(value);
  };

  return (
    <>
      {isEditing ? (
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => {
            setIsEditing(false);
            setValue(initialValue);
          }}
          autoFocus
        />
      ) : (
        <Chip
          label={value}
          onDelete={onDelete}
          className={classes.chip}
          style={{ margin: 5 }}
          deleteIcon={<DeleteIcon />}
          onClick={() => setIsEditing(true)}
        />
      )}
      {isEditing && (
        <IconButton onMouseDown={handleUpdate}>
          <DoneIcon />
        </IconButton>
      )}
    </>
  );
};

export default EditableChip;
