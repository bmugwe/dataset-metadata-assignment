import React, { useState, useEffect } from "react";
import {
    Box,
    CircularProgress,
    Typography,
    Grid,
    Paper,
} from "@mui/material";
import {
    SingleSelect,
    SingleSelectOption,
    OrganisationUnitTree,
    OrganisationUnitTreeRootLoading,
    Button,
} from "@dhis2/ui";
import { useDataQuery, useDataMutation } from "@dhis2/app-runtime";

// Queries and mutation as per DHIS2 docs
const query = {
    me: {
        resource: "me",
        params: {
            fields: ["id", "name", "email", "organisationUnits[id,name,level,path]"],
        },
    },
    datasets: {
        resource: "dataSets",
        params: {
            fields: ["id", "displayName", "code"],
            paging: "false",
        },
    }
};

const orgUnitQuery = {
    organisationUnits: {
        resource: "dataSets",
        id: ({ id }) => id,
        params: {
            fields: "id,path,displayName,organisationUnits[id,path,displayName,level]",
            paging: false,
        },
    },
};

const mutation = {
    resource: 'dataSets/KAZuvG5qU7Y/organisationUnits',
    type: 'create',
    data: ({ additions, deletions }) => ({
        additions,
        deletions,
    }),
};

const OuLinker = () => {
    const [selectedDataSet, setSelectedDataSet] = useState("");
    const [selectedDataSetName, setSelectedDataSetName] = useState("");
    const [additions, setAdditions] = useState([]);
    const [deletions, setDeletions] = useState([]);
    const [dataSetOrgUnitsFetched, setDataSetOrgUnitsFetched] = useState([]);
    const [userOrgUnitsFetched, setUserOrgUnitsFetched] = useState(false);

    // Fetch user and datasets
    const { data, error, loading } = useDataQuery(query);

    // Fetch org units for selected dataset
    const {
        data: ouData,
        loading: ouLoading,
        refetch: ouRefetch,
    } = useDataQuery(orgUnitQuery, {
        lazy: true,
        variables: { id: selectedDataSet }
    });

    // Mutation for saving changes
    const [mutate, { loading: saving }] = useDataMutation(mutation);

    // Update datasets and org units when data changes
    useEffect(() => {
        if (data && selectedDataSet) {
            ouRefetch({ id: selectedDataSet });
        }
        setUserOrgUnitsFetched(true);
    }, [data, selectedDataSet, ouRefetch]);

    // Update selected org units when ouData changes
    useEffect(() => {
        if (ouData) {
            const ous = ouData?.organisationUnits?.organisationUnits || [];
            setDataSetOrgUnitsFetched(ous.map((ou) => ou.path));
        } else {
            setDataSetOrgUnitsFetched([]);
        }
    }, [ouData]);

    // Handle dataset selection
    const handleDatasetChange = ({ selected }) => {
        setSelectedDataSet(selected);
        const selectedDataset = (data?.datasets?.dataSets || []).find(ds => ds.id === selected);
        setSelectedDataSetName(selectedDataset ? selectedDataset.displayName : "");
        setAdditions([]);
        setDeletions([]);
    };

    // Handle org unit selection/deselection
    const handleOrgUnitChange = ({ id, checked }) => {
        if (checked) {
            setAdditions(prev => prev.some(ou => ou.id === id) ? prev : [...prev, { id }]);
            setDeletions(prev => prev.filter(ou => ou.id !== id));
        } else {
            setDeletions(prev => prev.some(ou => ou.id === id) ? prev : [...prev, { id }]);
            setAdditions(prev => prev.filter(ou => ou.id !== id));
        }
    };

    // Save changes
    const handleSave = async () => {
        await mutate({ additions, deletions }).then(() => {
            alert("Changes saved successfully");
        }).catch(err => {
            alert("Error saving changes: " + err.message);
        });
        setAdditions([]);
        setDeletions([]);
        if (selectedDataSet) {
            ouRefetch({ id: selectedDataSet });
        }
    };

    // UI
    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">Select Dataset</Typography>
                        {loading ? (
                            <CircularProgress />
                        ) : (
                            <SingleSelect
                                selected={selectedDataSet}
                                onChange={handleDatasetChange}
                                placeholder="Select a Dataset"
                                filterable
                                clearable
                                style={{ width: "100%" }}
                            >
                                {(data?.datasets?.dataSets || []).map(ds => (
                                    <SingleSelectOption
                                        key={ds.id}
                                        value={ds.id}
                                        label={ds.displayName}
                                    />
                                ))}
                            </SingleSelect>
                        )}
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, height: 400, overflow: "auto" }}>
                        <Typography variant="h6">Organisation Unit Tree</Typography>
                        {userOrgUnitsFetched && data?.me?.organisationUnits ? (
                            ouLoading ? (
                                <OrganisationUnitTreeRootLoading />
                            ) : (
                                <OrganisationUnitTree
                                    roots={data.me.organisationUnits.map(ou => ou.id)}
                                    onChange={handleOrgUnitChange}
                                    selectable
                                    filterable
                                    disableSelection={false}
                                    selected={dataSetOrgUnitsFetched}
                                />
                            )
                        ) : (
                            <OrganisationUnitTreeRootLoading />
                        )}
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, height: 400 }}>
                        <Typography variant="h6" gutterBottom>
                            Summary
                        </Typography>
                        <Typography>Dataset: <b>{selectedDataSetName || "None selected"}</b></Typography>
                        <Typography>Org Units Linked: <b>{dataSetOrgUnitsFetched.length}</b></Typography>
                        <Typography color="green">Additions: <b>{additions.length}</b></Typography>
                        <Typography color="red">Deletions: <b>{deletions.length}</b></Typography>
                        <Box sx={{ mt: 2 }}>
                            <Button
                                primary
                                disabled={additions.length === 0 && deletions.length === 0}
                                onClick={handleSave}
                                loading={saving}
                            >
                                Save Changes
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
            {error && (
                <Box sx={{ mt: 2 }}>
                    <Typography color="error">Error: {error.message}</Typography>
                </Box>
            )}
        </Box>
    );
};

export default OuLinker;