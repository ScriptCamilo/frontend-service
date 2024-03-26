import React, { useEffect } from "react";

import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import { Button, Divider, } from "@material-ui/core";

const TemplatePreview = ({ body }) => {
	const [showMore, setShowMore] = React.useState(false);
	const [bodyText, setBodyText] = React.useState('');
	const [bodyButtons, setBodyButtons] = React.useState([]);

	useEffect(() => {
		const findBodyText = body.find(item => item.type === 'body');
		const findBodyButtons = body.filter(item => item.type !== 'body');

		setBodyText(findBodyText?.text);
		setBodyButtons(findBodyButtons);
		if (findBodyButtons.length === 1) {
			setShowMore(true);
		}
	}, [body]);

	const renderButtons = () => {
		return (
			<>
				{showMore ? (
					<Grid item xs={12} >
						<Divider />
						{bodyButtons && bodyButtons.map((button) => {
							if (button.type !== "body") {
								return (
									<Button
										variant="outlined"
										color="secondary"
										fullWidth
										style={{
											cursor: 'not-allowed',
											marginBottom: '2px',
										}}
									>
										{button.text}
									</Button>
								)
							}
							return null;
						})}
					</Grid>
				) : (
					<Grid item xs={12} >
						<Divider />
						{bodyButtons && (
							<>
								<Button
									variant="outlined"
									color="secondary"
									fullWidth
									style={{
										cursor: 'not-allowed',
										marginBottom: '2px',
									}}
								>
									{bodyButtons[0]?.text}
								</Button>
								<p
									onClick={() => setShowMore(true)}
									style={{ color: 'blue', cursor: 'pointer', fontWeight: 'bold' }}
								>
									Mostrar Mais
								</p>
							</>
						)}
					</Grid>
				)}
			</>
		)
	}

  return (
    <>
      <div style={{
        minWidth: "250px",
      }}>
        <Grid container spacing={1}>
          <Grid item xs={9}>
            <Typography style={{ marginTop: "12px", marginLeft: "10px" }} variant="subtitle1" gutterBottom>
              {bodyText}
            </Typography>
          </Grid>
					{bodyButtons.length > 0 && renderButtons()}
        </Grid>
      </div>
    </>
  );
};

export default TemplatePreview;
