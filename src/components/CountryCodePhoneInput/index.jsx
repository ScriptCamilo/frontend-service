import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { getIn } from 'formik';

const useStyles = makeStyles(_theme => ({
  errorTextStyles: {
    color: "#f44336",
    fontSize: "0.75rem",
    letterSpacing: "0.03333em",
    margin: "3px 0 4px 16px",
    textAlign: "left"
	},
}));


const	inputDefault = {
  border: "1px solid #42722c",
  height: '40px',
  marginBottom: '3px',
  width: '230px'
};

const	buttonDefault = {
  border: "1px solid #42722c",
};

const CountryCodePhoneInput = (props) => {
  const classes = useStyles();
  
  const {
    field: { name, value },
    form: { errors, handleBlur, setFieldValue, touched },
    country,
    onChange,
  } = props;

  const [isFocused, setFocused] = useState(false);
  const [inputStyles, setInputStyles] = useState(inputDefault)
  const [buttonStyles, setButtonStyles] = useState(buttonDefault)

  const isError = getIn(errors, name);

  const getStyles = () => {
    const	styles = {
      input: {
        border: '1px solid #42722c',
        height: '40px',
        width: '230px'
      },
      button: {
        border: '1px solid #42722c',
      }
    };

    if(isError && isFocused) {
      styles.input.border = '2px solid #f44336';
      styles.button.border = '2px solid #f44336';
      return styles;
    }

    if(isError) {
      styles.input.border = '1px solid #f44336';
      styles.button.border = '1px solid #f44336';
      return styles;
    }

    if(isFocused) {
      styles.input.border = '2px solid #42722c';
      styles.button.border = '2px solid #42722c';
      return styles;
    }

    return styles;
  }

  useEffect(() => {
    setInputStyles(getStyles().input);
    setButtonStyles(getStyles().button);
  }, [isError, isFocused, value]);

  const handleInputBlur = (e) => {
    setFocused(false);
    handleBlur(e);
  };

  const onValueChange = (phoneNumber) => {
    setFieldValue(name, phoneNumber);

    if (onChange !== null) {
      onChange(phoneNumber);
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
      paddingBottom: "4px"
    }}>
      <PhoneInput
        inputProps={{ placeholder: "Número do Whatsapp" }}
        preferredCountries={['br', 'us', 'pt', 'fr']}
        dropdownStyle={{ height: '140px', width: '232px' }}
        inputStyle={ inputStyles }
        buttonStyle={ buttonStyles }
        name={name}
        value={value}
        onChange={onValueChange}
        onFocus={ () => setFocused(true) }
        onBlur={ (e) => handleInputBlur(e) }
        countryCodeEditable={false}
        country={country}
        masks={{ br: '(..) .....-....'}}
      />
      {isError && (        
        <div className={ classes.errorTextStyles } >
          {isError && getIn(errors, name)}
        </div>
      )}
    </div>
  );
}

CountryCodePhoneInput.defaultProps = {
  onChange: null,
  country: 'br',
  disabled: false,
}

export default CountryCodePhoneInput;
