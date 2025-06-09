"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton
} from "@mui/material";
import axios from "axios";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const TEMPLATE_INSTRUCTIONS = [
  {
    title: "The Optimist",
    longDesc: "You always see the bright side and encourage others to stay positive.",
  },
  {
    title: "The Thoughtful Analyst",
    longDesc: "You approach every situation with careful consideration and logic. You provide well-reasoned, detailed responses, weighing pros and cons, and help others make informed decisions by breaking down complex topics into understandable parts. You value accuracy, clarity, and thoughtful communication, always aiming to support others in understanding the bigger picture.",
  },
];

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#18181b",
      paper: "#23232a",
    },
    primary: {
      main: "#90caf9",
    },
    secondary: {
      main: "#f48fb1",
    },
  },
  shape: {
    borderRadius: 12,
  },
});

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AgentListPage() {
  const [agents, setAgents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", instructions: "", template: "" });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await axios.get(`${API_URL}/v1/agents`);

      console.log(response);

      const data = await response.data.data;
      console.log(data);
      setAgents(data);
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  const handleAddAgent = async (e) => {
    e.preventDefault();
    if (!form.name || !form.instructions) return;

    try {
      await axios.post(`${API_URL}/v1/agents`, {
        name: form.name,
        instructions: form.instructions,
      });

      await fetchAgents();

      setForm({ name: "", instructions: "" });
      setShowForm(false);
    } catch (error) {
      console.error("Error adding agent:", error);
    }
  };

  const handleTemplateChange = (e) => {
    const templateLongDesc = e.target.value;
    setForm((f) => ({ ...f, template: templateLongDesc, instructions: templateLongDesc }));
  };

  const handleEditAgent = (id) => {
    const agent = agents.find((a) => a.id === id);
    if (!agent) return;
    setForm({ name: agent.name, instructions: agent.instructions, template: agent.instructions });
    setEditMode(true);
    setEditId(id);
    setShowForm(true);
  };

  const handleUpdateAgent = async (e) => {
    e.preventDefault();

    try {
      await axios.patch(`${API_URL}/v1/agents/${editId}`, {
        name: form.name,
        instructions: form.instructions,
      });

      await fetchAgents();

      setForm({ name: "", instructions: "" });
      setEditMode(false);
      setEditId(null);
      setShowForm(false);
    } catch (error) {
      console.error("Error updating agent:", error);
    }

  };

  const handleCancelEdit = () => {
    setForm({ name: "", instructions: "" });
    setEditMode(false);
    setEditId(null);
    setShowForm(false);
  };

  const handleDeleteAgent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this agent?")) return;
    try {
      await axios.delete(`${API_URL}/v1/agents/${id}`);
      await fetchAgents();
    } catch (error) {
      console.error("Error deleting agent:", error);
    }
  };

  function NoSSR({ children }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
      setMounted(true);
    }, []);
    if (!mounted) return null;
    return children;
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box minHeight="100vh" bgcolor="background.default" display="flex" alignItems="center" justifyContent="center">
        <Card sx={{ maxWidth: 600, width: '100%', borderRadius: 3, boxShadow: 8 }}>
          <CardContent>
            <Typography variant="h4" gutterBottom color="primary.light">Simple Chatbots</Typography>
            <Box component="ul" p={0} sx={{ listStyle: "none", mb: 2 }}>
              {agents.map((agent) => (
                <Card
                  key={agent.id}
                  sx={{ mb: 2, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2 }}
                >
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} color="primary.light">{agent.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {agent.instructions.slice(0, 40)}...
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => router.push(`/agent/${agent.id}`)}
                      sx={{ ml: 2 }}
                    >
                      Chat
                    </Button>
                    <IconButton color="secondary" onClick={() => handleEditAgent(agent.id)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteAgent(agent.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Card>
              ))}

              {agents.length === 0 && (
                <Typography variant="body1" color="text.secondary">No agents found</Typography>
              )}
            </Box>
            <Button
              onClick={() => {
                setShowForm((v) => !v);
                if (editMode) handleCancelEdit();
              }}
              variant={showForm ? "outlined" : "contained"}
              color="secondary"
              sx={{ mt: 1, mb: 2, width: '100%' }}
            >
              {showForm ? (editMode ? "Cancel Edit" : "Cancel") : "Add New Agent"}
            </Button>
            {showForm && (
              <Box
                component="form"
                onSubmit={editMode ? handleUpdateAgent : handleAddAgent}
                mt={2}
                display="flex"
                flexDirection="column"
                gap={2}
              >
                <TextField
                  label="Agent Name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  fullWidth
                  autoFocus
                />
                <FormControl fullWidth>
                  <InputLabel>Template Instruction</InputLabel>
                  <Select
                    value={form.template}
                    onChange={handleTemplateChange}
                    label="Template Instruction"
                  >
                    <MenuItem value="">
                      <em>Choose template instructions</em>
                    </MenuItem>
                    {TEMPLATE_INSTRUCTIONS.map((tpl, i) => (
                      <MenuItem key={i} value={tpl.longDesc}>{tpl.title}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Instruction for agent"
                  value={form.instructions}
                  onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
                  required
                  fullWidth
                  multiline
                  rows={3}
                />
                <Button type="submit" variant="contained" color="primary" sx={{ fontWeight: 600 }}>
                  {editMode ? "Update Agent" : "Create Agent"}
                </Button>
                {editMode && (
                  <Button onClick={handleCancelEdit} color="secondary" variant="text">
                    Cancel
                  </Button>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
}
