import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { Provider } from '@dhis2/app-runtime';
import OuLinker from './pages/OuLinker';

const config = {
  baseUrl: process.env.REACT_APP_DHIS2_BASE_URL || 'https://hiskenya.org',
  apiVersion: '',
};

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Provider config={config}>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <Tab label="OU Linker" {...a11yProps(0)} />
            {/* <Tab label="Search" {...a11yProps(1)} />
            <Tab label="Transfer" {...a11yProps(2)} /> */}
            {/* <Tab label="Transfer TEIs" {...a11yProps(3)} /> */}
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <OuLinker />
        </CustomTabPanel>
      </Box>
    </Provider>
  );
}