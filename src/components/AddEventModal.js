import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { TextField } from "@mui/material";
import { makeStyles } from "@mui/styles";
/* For "Create" Button in Modal Box */
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import DateAdapter from "@mui/lab/AdapterMoment";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import MobileDateTimePicker from "@mui/lab/MobileDateTimePicker";
import Alert from "@mui/material/Alert";
import moment from 'moment';

import { pushData, uploadPhotoToStorage } from "../utilities/firebase";

const useStyles = makeStyles({
  container: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "white",
    width: "350px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-evenly",
    padding: "10px",
    borderRadius: "10px",
    overflow: "auto",
    height: "80%",
    overflowY: "scroll",
  },
  title: {
    textAlign: "center",
  },
  form: {
    height: "100%",
    overflowY: "scroll",
  },
});
function createEventInFirebase(event) {
  pushData("/events", event);
}

const AddEventModal = ({ user, open, handleOpen, handleClose }) => {
  const classes = useStyles();
  const defaultValues = {
    description: "",
    duration: 0,
    location: "",
    max: 2,
    name: "",
    people: user ? [user.uid] : "",
    photoUrl: "",
    eventTime: null,
  };

  const [formValues, setFormValues] = useState(defaultValues);
  const [image, setImage] = useState(null);
  const [dateEmptyError, setDateEmptyError] = useState(false);

  const [now, setNow] = useState(moment());

  const handleInputChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;

    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //setNow(new Date());
    if (formValues.eventTime === null) {
      setDateEmptyError(true);
      return;
    }


    const photoUrl = await uploadPhotoToStorage(image);
    console.log(photoUrl);

    formValues.photoUrl = photoUrl;

    createEventInFirebase(formValues);
    setFormValues(defaultValues);


    //NEED TO RERENDER
    handleClose();
  };

  const onImageChange = (e) => {
    console.log("[onImageChange] run");
    const reader = new FileReader();
    let file = e.target.files[0];
    if (file) {
      console.log(file);
      setFormValues({
        ...formValues,
        photoUrl: file.name,
      });
      reader.onload = () => {
        if (reader.readyState === 2) {
          setImage(file);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
      // if there is no file, set image back to null
    } else {
      setImage(null);
    }
  };
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      sx={{ "& .MuiTextField-root": { m: 2, width: "25ch" } }}
    >
      <Box className={classes.container}>
        <form
          onSubmit={handleSubmit}
          style={{ textAlign: "center" }}
          className={classes.form}
        >
          <Typography
            variant="h5"
            component="h5"
            align="center"
            className={classes.title}
          >
            Add New Event
          </Typography>
          <TextField
            required
            name="name"
            value={formValues.name}
            onChange={handleInputChange}
            label="Event Name"
            variant="outlined"
            inputProps={{ maxLength: 20 }}
          />
          <TextField
            required
            name="max"
            value={formValues.max}
            onChange={handleInputChange}
            label="Max # of People"
            type="number"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            required
            name="location"
            value={formValues.location}
            onChange={handleInputChange}
            label="Event Location"
          />
          <LocalizationProvider dateAdapter={DateAdapter}>
            <MobileDateTimePicker
              minDateTime={now}
              name="eventTime"
              renderInput={(props) => <TextField {...props} />}
              label="Date & Time *"
              value={formValues.eventTime}
              onChange={(newValue) => {
                setFormValues({
                  ...formValues,
                  eventTime: newValue.valueOf(),
                });
                setDateEmptyError(false);
              }}
            />
            {dateEmptyError && (
              <Alert severity="error">Date and Time field is required.</Alert>
            )}
          </LocalizationProvider>
          <TextField
            required
            name="duration"
            value={formValues.duration}
            onChange={handleInputChange}
            label="Duration (Hours)"
            type="number"
            InputLabelProps={{ shrink: true }}
            InputProps={{ inputProps: { min: 1} }}
          />{" "}
          <input
            required
            type="file"
            accept="image/*"
            onChange={(e) => {
              onImageChange(e);
            }}
          />
          <TextField
            required
            name="description"
            value={formValues.description}
            onChange={handleInputChange}
            label="Description"
            multiline
            rows={4}
          />
          <Button variant="contained" endIcon={<SendIcon />} type="submit">
            Create
          </Button>
          <Button type="button" onClick={() => handleClose()}>
            {" "}
            Cancel{" "}
          </Button>
        </form>
      </Box>
    </Modal>
  );
};
export default AddEventModal;
