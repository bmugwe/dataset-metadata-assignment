import React, { useState, useEffect } from "react";
import {
  TextField,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Typography,
  Grid2 as Grid,
  Paper,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { BrowserRouter } from "react-router-dom";
import {
  SingleSelect,
  SingleSelectOption,
  OrganisationUnitTree,
  OrganisationUnitTreeRootError,
  Button,
} from "@dhis2/ui";
import { useDataQuery } from "@dhis2/app-runtime";

// Define the GraphQL or REST query to fetch data
const query = {
  me: {
    resource: "me",
    params: {
      fields: ["id", "name", "email", "organisationUnits[id,name,level,path]"],
    },
  },
  // Uncomment and adjust as needed
  // program_data: {
  //   resource: 'sqlViews/tEswW8DtwF0/data',
  //   params: ({ vars, programid }) => ({
  //     var: `va_r:${vars}`,
  //   }),
  // },
  datasets: {
    resource: "dataSets",
    params: {
      fields: ["id", "displayName", "code"],
      paging: "false",
    },
  }
  ,
  organisationUnits: {
    resource: "organisationUnits",
    params: {
      // nested children up to needed depth
      fields:
        "id,displayName,path,children[id,displayName,path]",
      paging: false,
    //   level: 1,
    },
  },
};
// HfVjCurKxh2
const OuLinker = () => {
  const ke_uid = ["FKt9UVErwh3"]; // Kenya FKt9UVErwh3
  const [selectedOption, setSelectedOption] = useState("GNIPmRNe57d");
  const [inputText, setInputText] = useState("");
  const [respHeader, setRespHeader] = useState([]);
  const [respRows, setRespRows] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [selectedDataSets, setSelectedDataSets] = useState("");
  const [selectedDataSetName, setSelectedDataSetName] = useState("");
  const [userOrgUnits, setUserOrgUnits] = useState([]);
  const [orgUnitRoots, setOrgUnitRoots] = useState(["FKt9UVErwh3"]); // default to Kenya
  const [dataSetOrgUnitsFetched, setDataSetOrgUnitsFetched] = useState([]);


//   const [allPaths, setAllPaths] = useState([])

  const [additions, setAdditions] = useState([])
  const [deletions, setDeletions] = useState([])

  // Fetch data using useDataQuery
  const { data, error, loading, refetch } = useDataQuery(query, {
    variables: {
      vars: inputText === "" ? "x" : inputText,
      programid: selectedOption,
    },
  });
  // create a second useDataQuery to fetch org units of the current user after the page has loaded
  const {
    data: ouData,
    error: ouError,
    loading: ouLoading,
    refetch: ouRefetch,
  } = useDataQuery(
    {
      organisationUnits: {
        resource: `dataSets/${selectedDataSets}/organisationUnits`,
        params: {
          fields: "id,path,displayName",
          paging: false,
        },
      },
    },
    {
      lazy: true,
    }
  );
  
  const allPaths = []
  // Update state when data changes
  useEffect(() => {
    if (data) {
      setRespHeader(data?.program_data?.listGrid?.headers || []);
      setRespRows(data?.program_data?.listGrid?.rows || []);
      // Map datasets to { value, label } for SingleSelect
      setDatasets(
        (data?.datasets?.dataSets || []).map((ds) => ({
          value: ds.id,
          label: ds.displayName,
        }))
      );

      setUserOrgUnits(data?.organisationUnits?.organisationUnits[0]?.id || 'HfVjCurKxh2');
      
    if(ke_uid !== userOrgUnits){
        // setOrgUnitRoots(userOrgUnits)
        console.log("User OU changed, should refetch tree now")
        setOrgUnitRoots(userOrgUnits || ke_uid)
        refetch()
    }

    //   can this be here really?
    const collectPaths = (node, prefix = '') => {
        const path = `${prefix}/${node.id}`
        allPaths.push(path)
        if (node.children) {
            node.children.forEach(child => collectPaths(child, path))
            if (node.children) {
            node.children.forEach(child => collectPaths(child, path))
        }
        }
    }
    data.organisationUnits.organisationUnits.forEach(root => collectPaths(root))

    }
  }, [data]);
  console.log({"Fetched data": data, allPaths});

 


  // Refetch when inputText or selectedOption changes
  useEffect(() => {
    refetch({
      vars: inputText === "" ? "x" : inputText,
      programid: selectedOption,
    });
  }, [inputText, selectedOption, refetch]);

  const handleDatasetChange = ({ selected }) => {
    setSelectedDataSets(selected);
    const selectedDataset = datasets.find(ds => ds.value === selected);
    setSelectedDataSetName(selectedDataset ? selectedDataset.label : "");
  };

const handleOrgUnitChange = ({ path, checked }) => {
const id = path.split('/').pop()

if (checked) {
    // new selection
    if (!dataSetOrgUnitsFetched.includes(path)) {
        setSelectedOrgUnits(prev => [...prev, path])
        setAdditions(prev => [...prev, { id }])
        setDeletions(prev => prev.filter(ou => ou.id !== id))
    }
} else {
    // deselection
    setSelectedOrgUnits(prev => prev.filter(p => p !== path))
    setDeletions(prev => [...prev, { id }])
    setAdditions(prev => prev.filter(ou => ou.id !== id))
}
}

  return (
    <BrowserRouter>
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 3 }}>
        <Box
          sx={{
            flex: 1,
            height: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "left",
 }}
        >
            <h4> {datasets.length} Datasets available:   </h4>
            <br />
          <SingleSelect
            selected={selectedDataSets}
            onChange={handleDatasetChange}
            placeholder="Select a Dataset"
            filterable
            clearable
            regular
            style={{ width: '300px' }}
            inputWidth="300px"
          >
            {datasets.map((opt) => (
              <SingleSelectOption
                key={opt.value}
                value={opt.value}
                label={opt.label}
              />
            ))}
          </SingleSelect>
        </Box>
        <Box
          sx={{
            flex: 1,
            height: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "left",
          }}
        ></Box>
      </Box>

      {error && (
        <Box sx={{ textAlign: "center", marginTop: 2 }}>
          <Typography color="error">Error: {error.message}</Typography>
        </Box>
      )}
      {loading ? (
        <Box sx={{ textAlign: "center", marginTop: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
        <Grid container spacing={2} maxHeight={300} sx={{ marginTop: 1 }}>
          <Grid size={4}>
            <h3>Organisation Unit Tree</h3>
            {/* <hr /> */}
          </Grid>
          <Grid size={4}></Grid>
          <Grid size={4}></Grid>
        </Grid>

        <Grid container spacing={4} maxHeight={300} sx={{ marginTop: 1 }}>
          <Grid size={4} sx={{ height: 300, overflow: "auto", border: 1 }}>
            <OrganisationUnitTree
                roots={data.me.organisationUnits.map(ou => ou.id)}
                // selected={dataSetOrgUnitsFetched}
                onChange={handleOrgUnitChange}
                selectable
                filterable
                // singleSelection={false}
                disableSelection={false}
                // initiallyExpanded={allPaths}  // open everything
                
            />
          </Grid>
          <Grid size={4} sx={{ height: 300, overflow: "auto" }}>
            {/* A ui to show selected additions, deletions count, dataset selected and a buttin to save and mutate data */}
            <Paper elevation={3} sx={{ padding: 2 , height: '99%'}}>
                <Typography variant="h6" gutterBottom>
                    Dataset: {selectedDataSetName || "None selected"}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Organisation Units Selected: {dataSetOrgUnitsFetched.length}
                </Typography>
                <Typography variant="body1" gutterBottom color="green">
                    Additions: {additions.length}
                </Typography>
                <Typography variant="body1" gutterBottom color="red">
                    Deletions: {deletions.length}
                </Typography>
                <Button
                    primary
                    disabled={additions.length === 0 && deletions.length === 0}
                    onClick={() => {
                        // Handle save action here
                        console.log("Saving changes...", { additions, deletions });
                        // After saving, clear the additions and deletions
                        setAdditions([]);
                        setDeletions([]);
                    }}
                >
                    Save Changes
                </Button>
            </Paper>
          </Grid>
          {/* <Grid size={4}></Grid> */}
        </Grid>
      </>
      )}
    </BrowserRouter>
  );
};

export default OuLinker;
