import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Textarea } from "./components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Badge } from "./components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table";
import { Separator } from "./components/ui/separator";
import { Users, Server, Settings, FileText, Plus, Eye, Trash2, Edit, LogOut } from "lucide-react";

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Auth Context
const AuthContext = React.createContext();

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [user, setUser] = useState(null);

  const login = (token, userData) => {
    setToken(token);
    setUser(userData);
    localStorage.setItem('auth_token', token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
  };

  const isAuthenticated = !!token;

  useEffect(() => {
    if (token) {
      axios.get(`${API_BASE_URL}/user/me`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(response => {
        setUser(response.data);
      }).catch(() => {
        logout();
      });
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// Landing Page
const LandingPage = () => {
  const [serverStats, setServerStats] = useState({ players: 0, max_players: 64, hostname: "Revolution Roleplay" });
  const [applications, setApplications] = useState([]);
  const [changelogs, setChangelogsState] = useState([]);

  useEffect(() => {
    const fetchServerStats = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/server-stats`);
        setServerStats(response.data);
      } catch (error) {
        console.error("Failed to fetch server stats:", error);
        // Use mock data if server is unreachable
        setServerStats({
          players: 1,
          max_players: 64,
          hostname: "Revolution Roleplay",
          gametype: "ESX Legacy"
        });
      }
    };

    const fetchApplications = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/applications`);
        setApplications(response.data);
      } catch (error) {
        console.error("Failed to fetch applications:", error);
      }
    };

    const fetchChangelogs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/changelogs`);
        setChangelogsState(response.data.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch changelogs:", error);
      }
    };

    fetchServerStats();
    fetchApplications();
    fetchChangelogs();

    const interval = setInterval(() => {
      fetchServerStats();
      fetchApplications();
      fetchChangelogs();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_e66817cd-11b4-4986-8bb5-ab2fe06c620d/artifacts/ag8fwiri_Revolution.png" 
                alt="Revolution RP" 
                className="h-12 w-12"
              />
              <h1 className="text-2xl font-bold text-white">Revolution Roleplay</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-green-400">
                <Server className="h-5 w-5" />
                <span className="font-semibold">{serverStats.players}/{serverStats.max_players}</span>
              </div>
              <Link to="/admin">
                <Button variant="outline" className="border-purple-500 text-purple-300 hover:bg-purple-500/20">
                  Admin Panel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30" 
          style={{backgroundImage: "url('https://customer-assets.emergentagent.com/job_e66817cd-11b4-4986-8bb5-ab2fe06c620d/artifacts/6wugvqcm_Foto_Revolution.jpg')"}}
        ></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-extrabold text-white mb-6">
            Velkommen til Revolution Roleplay
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Oplev det bedste roleplay på FiveM med vores dedikerede community og realistiske gameplay.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3">
              <a href="#applications">Ansøg Nu</a>
            </Button>
            <a href="https://discord.gg/htQNqeuxUY" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-3">
                Discord Server
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Server Stats */}
      <section className="py-16 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white/5 border-purple-500/20 text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Aktive Spillere</CardTitle>
                  <Users className="h-8 w-8 text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400">{serverStats.players}/{serverStats.max_players}</div>
                <p className="text-gray-400 text-sm">Spillere online nu</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 border-purple-500/20 text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Server Status</CardTitle>
                  <Server className="h-8 w-8 text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-400">ONLINE</div>
                <p className="text-gray-400 text-sm">{serverStats.hostname}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 border-purple-500/20 text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Åbne Ansøgninger</CardTitle>
                  <FileText className="h-8 w-8 text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-400">{applications.length}</div>
                <p className="text-gray-400 text-sm">Aktive stillings ansøgninger</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Changelogs Section */}
      <section className="py-20 bg-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-white mb-4">Seneste Ændringer</h3>
            <p className="text-gray-300 text-lg">Server opdateringer og forbedringer</p>
          </div>
          
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {changelogs.map((changelog) => (
              <Card key={changelog.id} className="bg-white/5 border-purple-500/20 text-white">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-xl font-semibold text-purple-300">{changelog.title}</h4>
                    {changelog.version && (
                      <Badge variant="outline" className="border-purple-500 text-purple-300">
                        v{changelog.version}
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-200 mb-3 whitespace-pre-line">{changelog.content}</p>
                  <div className="text-sm text-gray-400">
                    {new Date(changelog.created_at).toLocaleDateString('da-DK')} - {changelog.created_by}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {changelogs.length === 0 && (
            <div className="text-center">
              <p className="text-gray-400">Ingen opdateringer at vise endnu</p>
            </div>
          )}
        </div>
      </section>

      {/* Applications Section */}
      <section id="applications" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-white mb-4">Ansøg til vores team</h3>
            <p className="text-gray-300 text-lg">Vi søger altid engagerede spillere til vores team</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app) => (
              <Card key={app.id} className="bg-white/5 border-purple-500/20 text-white hover:bg-white/10 transition-all">
                <CardHeader>
                  <CardTitle className="text-xl">{app.title}</CardTitle>
                  <CardDescription className="text-gray-300">{app.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                      {app.position}
                    </Badge>
                    <p className="text-gray-400 text-sm">{app.fields.length} spørgsmål</p>
                    <Link to={`/apply/${app.id}`}>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        Ansøg Nu
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-purple-500/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center space-x-4 mb-4">
            <img 
              src="https://customer-assets.emergentagent.com/job_e66817cd-11b4-4986-8bb5-ab2fe06c620d/artifacts/ag8fwiri_Revolution.png" 
              alt="Revolution RP" 
              className="h-8 w-8"
            />
            <span className="text-white font-semibold">Revolution Roleplay</span>
          </div>
          <p className="text-gray-400">&copy; 2025 Revolution Roleplay. Alle rettigheder forbeholdes.</p>
        </div>
      </footer>
    </div>
  );
};

// Application Form Page
const ApplicationForm = () => {
  const { id: formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState({});
  const [applicantName, setApplicantName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/applications/${formId}`);
        setForm(response.data);
        const initialResponses = {};
        response.data.fields.forEach(field => {
          initialResponses[field.id] = field.field_type === 'checkbox' ? [] : '';
        });
        setResponses(initialResponses);
      } catch (error) {
        console.error("Failed to fetch form:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [formId]);

  const handleFieldChange = (fieldId, value) => {
    setResponses(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!applicantName.trim()) {
      alert("Indtast venligst dit navn");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/applications/submit`, {
        form_id: formId,
        applicant_name: applicantName,
        responses
      });
      alert("Ansøgning sendt successfully!");
      navigate('/');
    } catch (error) {
      console.error("Failed to submit application:", error);
      alert("Fejl ved indsendelse af ansøgning");
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field) => {
    switch (field.field_type) {
      case 'text':
        return (
          <Input
            placeholder={field.placeholder}
            value={responses[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            className="bg-white/5 border-purple-500/30 text-white"
          />
        );
      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder}
            value={responses[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            rows={4}
            className="bg-white/5 border-purple-500/30 text-white"
          />
        );
      case 'select':
        return (
          <Select onValueChange={(value) => handleFieldChange(field.id, value)} required={field.required}>
            <SelectTrigger className="bg-white/5 border-purple-500/30 text-white">
              <SelectValue placeholder="Vælg en mulighed" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return null;
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Indlæser...</div>;
  if (!form) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Ansøgning ikke fundet</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="bg-white/10 border-purple-500/20 text-white">
          <CardHeader>
            <CardTitle className="text-3xl text-center">{form.title}</CardTitle>
            <CardDescription className="text-gray-300 text-center text-lg">
              {form.description}
            </CardDescription>
            <Badge variant="secondary" className="bg-purple-600/20 text-purple-300 w-fit mx-auto">
              {form.position}
            </Badge>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="applicant_name" className="text-white">Dit navn *</Label>
                <Input
                  id="applicant_name"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  required
                  className="bg-white/5 border-purple-500/30 text-white"
                  placeholder="Indtast dit fulde navn"
                />
              </div>

              <Separator className="bg-purple-500/20" />

              {form.fields.map((field) => (
                <div key={field.id}>
                  <Label className="text-white">
                    {field.label} {field.required && <span className="text-red-400">*</span>}
                  </Label>
                  <div className="mt-2">
                    {renderField(field)}
                  </div>
                </div>
              ))}

              <div className="flex space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  className="flex-1 border-gray-500 text-gray-300 hover:bg-gray-800"
                >
                  Annuller
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {submitting ? 'Sender...' : 'Send Ansøgning'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Admin Login
const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/admin/login`, credentials);
      const userData = { 
        username: credentials.username, 
        type: 'admin', 
        role: response.data.user.role,
        id: response.data.user.id,
        allowed_forms: response.data.user.allowed_forms || [],
        is_admin: response.data.user.role === 'admin',
        is_staff: ['admin', 'staff'].includes(response.data.user.role)
      };
      login(response.data.token, userData);
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Forkerte loginoplysninger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Card className="w-full max-w-md bg-white/10 border-purple-500/20">
        <CardHeader className="text-center">
          <img 
            src="https://customer-assets.emergentagent.com/job_e66817cd-11b4-4986-8bb5-ab2fe06c620d/artifacts/ag8fwiri_Revolution.png" 
            alt="Revolution RP" 
            className="h-16 w-16 mx-auto mb-4"
          />
          <CardTitle className="text-2xl text-white">Admin Panel</CardTitle>
          <CardDescription className="text-gray-300">Log ind for at administrere serveren</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-white">Brugernavn</Label>
              <Input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                required
                className="bg-white/5 border-purple-500/30 text-white"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-white">Adgangskode</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                required
                className="bg-white/5 border-purple-500/30 text-white"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700" 
              disabled={loading}
            >
              {loading ? 'Logger ind...' : 'Log ind'}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Link to="/" className="text-purple-400 hover:text-purple-300 text-sm">
              ← Tilbage til forsiden
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Admin Dashboard
const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [serverStats, setServerStats] = useState({});

  useEffect(() => {
    fetchApplications();
    fetchSubmissions();
    fetchServerStats();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE_URL}/admin/application-forms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(response.data);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE_URL}/admin/submissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubmissions(response.data);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    }
  };

  const fetchServerStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/server-stats`);
      setServerStats(response.data);
    } catch (error) {
      console.error('Failed to fetch server stats:', error);
      // Use mock data
      setServerStats({
        players: 1,
        max_players: 64,
        hostname: "Revolution Roleplay"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <header className="bg-black/20 backdrop-blur-md border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img 
              src="https://customer-assets.emergentagent.com/job_e66817cd-11b4-4986-8bb5-ab2fe06c620d/artifacts/ag8fwiri_Revolution.png" 
              alt="Revolution RP" 
              className="h-10 w-10"
            />
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">
              Velkommen, {user?.username} ({user?.role})
            </span>
            <Button onClick={logout} variant="outline" className="border-red-500 text-red-300 hover:bg-red-500/20">
              Log ud
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-white/10 border-purple-500/20">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-purple-600">Oversigt</TabsTrigger>
            {user?.is_admin && (
              <TabsTrigger value="applications" className="text-white data-[state=active]:bg-purple-600">Ansøgninger</TabsTrigger>
            )}
            <TabsTrigger value="submissions" className="text-white data-[state=active]:bg-purple-600">Indsendte Ansøgninger</TabsTrigger>
            {user?.is_admin && (
              <>
                <TabsTrigger value="changelogs" className="text-white data-[state=active]:bg-purple-600">Changelogs</TabsTrigger>
                <TabsTrigger value="users" className="text-white data-[state=active]:bg-purple-600">Brugerstyring</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="overview">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-white/10 border-purple-500/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Spillere Online
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">{serverStats.players || 0}/{serverStats.max_players || 64}</div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-purple-500/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Aktive Ansøgninger
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">{applications.filter(a => a.is_active).length}</div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-purple-500/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Nye Ansøgninger
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-400">{submissions.filter(s => s.status === 'pending').length}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/10 border-purple-500/20 text-white">
              <CardHeader>
                <CardTitle>Seneste Ansøgninger</CardTitle>
                <CardDescription className="text-gray-300">
                  {user?.role === 'staff' ? 'Du har staff adgang - kan administrere tildelte ansøgninger' : 'Du har fuld admin adgang'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {submissions.slice(0, 5).map(submission => (
                    <div key={submission.id} className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                      <div>
                        <p className="font-semibold">{submission.applicant_name}</p>
                        <p className="text-sm text-gray-400">
                          {new Date(submission.submitted_at).toLocaleDateString('da-DK')}
                        </p>
                      </div>
                      <Badge variant={submission.status === 'pending' ? 'default' : submission.status === 'approved' ? 'secondary' : 'destructive'}>
                        {submission.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {user?.is_admin && (
            <TabsContent value="applications">
              <ApplicationManager applications={applications} onUpdate={fetchApplications} />
            </TabsContent>
          )}

          <TabsContent value="submissions">
            <SubmissionManager submissions={submissions} onUpdate={fetchSubmissions} />
          </TabsContent>

          {user?.is_admin && (
            <>
              <TabsContent value="changelogs">
                <ChangelogManager />
              </TabsContent>
              <TabsContent value="users">
                <UserManager applications={applications} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
};

// Application Manager Component
const ApplicationManager = ({ applications, onUpdate }) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  const [newForm, setNewForm] = useState({
    title: '',
    description: '',
    position: '',
    fields: [],
    webhook_url: ''
  });

  const addField = (isEditing = false) => {
    const field = {
      id: Date.now().toString(),
      label: '',
      field_type: 'text',
      options: [],
      required: false,
      placeholder: ''
    };
    
    if (isEditing) {
      setEditingForm(prev => ({
        ...prev,
        fields: [...prev.fields, field]
      }));
    } else {
      setNewForm(prev => ({
        ...prev,
        fields: [...prev.fields, field]
      }));
    }
  };

  const updateField = (index, updatedField, isEditing = false) => {
    if (isEditing) {
      setEditingForm(prev => ({
        ...prev,
        fields: prev.fields.map((field, i) => i === index ? updatedField : field)
      }));
    } else {
      setNewForm(prev => ({
        ...prev,
        fields: prev.fields.map((field, i) => i === index ? updatedField : field)
      }));
    }
  };

  const removeField = (index, isEditing = false) => {
    if (isEditing) {
      setEditingForm(prev => ({
        ...prev,
        fields: prev.fields.filter((_, i) => i !== index)
      }));
    } else {
      setNewForm(prev => ({
        ...prev,
        fields: prev.fields.filter((_, i) => i !== index)
      }));
    }
  };

  const handleCreateForm = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      await axios.post(`${API_BASE_URL}/admin/application-forms`, newForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsCreateDialogOpen(false);
      setNewForm({
        title: '',
        description: '',
        position: '',
        fields: [],
        webhook_url: ''
      });
      onUpdate();
    } catch (error) {
      console.error('Failed to create form:', error);
      alert('Fejl ved oprettelse af ansøgningsformular');
    }
  };

  const handleEditForm = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      await axios.put(`${API_BASE_URL}/admin/application-forms/${editingForm.id}`, {
        title: editingForm.title,
        description: editingForm.description,
        position: editingForm.position,
        fields: editingForm.fields,
        webhook_url: editingForm.webhook_url
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsEditDialogOpen(false);
      setEditingForm(null);
      onUpdate();
    } catch (error) {
      console.error('Failed to update form:', error);
      alert('Fejl ved opdatering af ansøgningsformular');
    }
  };

  const handleDeleteForm = async (formId) => {
    if (!window.confirm('Er du sikker på, at du vil slette denne ansøgningsformular?')) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      await axios.delete(`${API_BASE_URL}/admin/application-forms/${formId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onUpdate();
    } catch (error) {
      console.error('Failed to delete form:', error);
      alert('Fejl ved sletning af ansøgningsformular');
    }
  };

  const openEditDialog = (form) => {
    setEditingForm({ ...form });
    setIsEditDialogOpen(true);
  };

  const renderFieldEditor = (field, index, isEditing = false) => {
    const currentForm = isEditing ? editingForm : newForm;
    
    return (
      <div key={field.id} className="p-4 bg-white/5 rounded-lg space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-semibold text-white">Felt {index + 1}</h4>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => removeField(index, isEditing)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-white">Felt label</Label>
            <Input
              value={field.label}
              onChange={(e) => updateField(index, { ...field, label: e.target.value }, isEditing)}
              className="bg-white/5 border-purple-500/30 text-white"
            />
          </div>
          
          <div>
            <Label className="text-white">Felt type</Label>
            <Select 
              value={field.field_type} 
              onValueChange={(value) => updateField(index, { ...field, field_type: value }, isEditing)}
            >
              <SelectTrigger className="bg-white/5 border-purple-500/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Tekst</SelectItem>
                <SelectItem value="textarea">Tekstområde</SelectItem>
                <SelectItem value="select">Dropdown</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label className="text-white">Placeholder tekst</Label>
          <Input
            value={field.placeholder || ''}
            onChange={(e) => updateField(index, { ...field, placeholder: e.target.value }, isEditing)}
            className="bg-white/5 border-purple-500/30 text-white"
          />
        </div>
        
        {field.field_type === 'select' && (
          <div>
            <Label className="text-white">Valgmuligheder (en per linje)</Label>
            <Textarea
              value={field.options?.join('\n') || ''}
              onChange={(e) => updateField(index, { 
                ...field, 
                options: e.target.value.split('\n').filter(opt => opt.trim()) 
              }, isEditing)}
              className="bg-white/5 border-purple-500/30 text-white"
              rows={3}
            />
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={`required-${field.id}`}
            checked={field.required}
            onChange={(e) => updateField(index, { ...field, required: e.target.checked }, isEditing)}
          />
          <Label htmlFor={`required-${field.id}`} className="text-white">Påkrævet felt</Label>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Ansøgningsformularer</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Ny Ansøgning
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-purple-500/20 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Opret ny ansøgningsformular</DialogTitle>
              <DialogDescription className="text-gray-300">
                Udfyld formularen for at oprette en ny ansøgning
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Titel</Label>
                  <Input
                    value={newForm.title}
                    onChange={(e) => setNewForm({...newForm, title: e.target.value})}
                    className="bg-white/5 border-purple-500/30 text-white"
                  />
                </div>
                
                <div>
                  <Label className="text-white">Position</Label>
                  <Input
                    value={newForm.position}
                    onChange={(e) => setNewForm({...newForm, position: e.target.value})}
                    className="bg-white/5 border-purple-500/30 text-white"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-white">Beskrivelse</Label>
                <Textarea
                  value={newForm.description}
                  onChange={(e) => setNewForm({...newForm, description: e.target.value})}
                  className="bg-white/5 border-purple-500/30 text-white"
                  rows={3}
                />
              </div>
              
              <div>
                <Label className="text-white">Discord Webhook URL (valgfri)</Label>
                <Input
                  value={newForm.webhook_url}
                  onChange={(e) => setNewForm({...newForm, webhook_url: e.target.value})}
                  className="bg-white/5 border-purple-500/30 text-white"
                  placeholder="https://discord.com/api/webhooks/..."
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-white text-lg">Formular felter</Label>
                  <Button onClick={() => addField()} variant="outline" className="border-purple-500 text-purple-300">
                    <Plus className="h-4 w-4 mr-2" />
                    Tilføj felt
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {newForm.fields.map((field, index) => renderFieldEditor(field, index))}
                </div>
              </div>
              
              <div className="flex space-x-4">
                <Button 
                  onClick={() => setIsCreateDialogOpen(false)} 
                  variant="outline"
                  className="flex-1 border-gray-500 text-gray-300"
                >
                  Annuller
                </Button>
                <Button 
                  onClick={handleCreateForm}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  disabled={!newForm.title || !newForm.position || newForm.fields.length === 0}
                >
                  Opret ansøgning
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {applications.map((app) => (
          <Card key={app.id} className="bg-white/10 border-purple-500/20 text-white">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{app.title}</CardTitle>
                  <CardDescription className="text-gray-300">{app.description}</CardDescription>
                  <Badge variant="secondary" className="bg-purple-600/20 text-purple-300 mt-2">
                    {app.position}
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openEditDialog(app)}
                    className="border-purple-500 text-purple-300"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteForm(app.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">{app.fields.length} felter</p>
                <p className="text-sm text-gray-400">
                  Oprettet: {new Date(app.created_at).toLocaleDateString('da-DK')}
                </p>
                {app.webhook_url && (
                  <p className="text-sm text-green-400">✓ Discord webhook konfigureret</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-900 border-purple-500/20 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rediger ansøgningsformular</DialogTitle>
            <DialogDescription className="text-gray-300">
              Opdater formularen efter behov
            </DialogDescription>
          </DialogHeader>
          
          {editingForm && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Titel</Label>
                  <Input
                    value={editingForm.title}
                    onChange={(e) => setEditingForm({...editingForm, title: e.target.value})}
                    className="bg-white/5 border-purple-500/30 text-white"
                  />
                </div>
                
                <div>
                  <Label className="text-white">Position</Label>
                  <Input
                    value={editingForm.position}
                    onChange={(e) => setEditingForm({...editingForm, position: e.target.value})}
                    className="bg-white/5 border-purple-500/30 text-white"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-white">Beskrivelse</Label>
                <Textarea
                  value={editingForm.description}
                  onChange={(e) => setEditingForm({...editingForm, description: e.target.value})}
                  className="bg-white/5 border-purple-500/30 text-white"
                  rows={3}
                />
              </div>
              
              <div>
                <Label className="text-white">Discord Webhook URL (valgfri)</Label>
                <Input
                  value={editingForm.webhook_url || ''}
                  onChange={(e) => setEditingForm({...editingForm, webhook_url: e.target.value})}
                  className="bg-white/5 border-purple-500/30 text-white"
                  placeholder="https://discord.com/api/webhooks/..."
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-white text-lg">Formular felter</Label>
                  <Button onClick={() => addField(true)} variant="outline" className="border-purple-500 text-purple-300">
                    <Plus className="h-4 w-4 mr-2" />
                    Tilføj felt
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {editingForm.fields.map((field, index) => renderFieldEditor(field, index, true))}
                </div>
              </div>
              
              <div className="flex space-x-4">
                <Button 
                  onClick={() => setIsEditDialogOpen(false)} 
                  variant="outline"
                  className="flex-1 border-gray-500 text-gray-300"
                >
                  Annuller
                </Button>
                <Button 
                  onClick={handleEditForm}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  disabled={!editingForm.title || !editingForm.position || editingForm.fields.length === 0}
                >
                  Gem ændringer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Submission Manager Component  
const SubmissionManager = ({ submissions, onUpdate }) => {
  const { user } = useAuth();
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredSubmissions = submissions.filter(submission => {
    if (statusFilter === 'all') return true;
    return submission.status === statusFilter;
  });

  const handleViewSubmission = async (submissionId) => {
    try {
      const submissions = getSubmissions();
      const submission = submissions.find(sub => sub.id === submissionId);
      
      if (submission) {
        // Check if user has access to this submission
        if (user?.role === 'staff' && user.allowed_forms && !user.allowed_forms.includes(submission.form_id)) {
          alert('Du har ikke adgang til denne ansøgning');
          return;
        }
        setSelectedSubmission(submission);
        setIsViewDialogOpen(true);
      }
    } catch (error) {
      console.error('Failed to fetch submission:', error);
      alert('Fejl ved hentning af ansøgning');
    }
  };

  const handleUpdateStatus = async (submissionId, newStatus) => {
    try {
      const submissions = getSubmissions();
      const submissionIndex = submissions.findIndex(sub => sub.id === submissionId);
      
      if (submissionIndex !== -1) {
        // Check if user has access to this submission
        const submission = submissions[submissionIndex];
        if (user?.role === 'staff' && user.allowed_forms && !user.allowed_forms.includes(submission.form_id)) {
          alert('Du har ikke adgang til denne ansøgning');
          return;
        }
        
        submissions[submissionIndex].status = newStatus;
        setSubmissions(submissions);
        
        onUpdate();
        if (selectedSubmission && selectedSubmission.id === submissionId) {
          setSelectedSubmission(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Fejl ved opdatering af status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600/20 text-yellow-300';
      case 'approved': return 'bg-green-600/20 text-green-300';
      case 'rejected': return 'bg-red-600/20 text-red-300';
      default: return 'bg-gray-600/20 text-gray-300';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Afventer';
      case 'approved': return 'Godkendt';
      case 'rejected': return 'Afvist';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Indsendte Ansøgninger</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-white/5 border-purple-500/30 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle ansøgninger</SelectItem>
            <SelectItem value="pending">Afventer</SelectItem>
            <SelectItem value="approved">Godkendt</SelectItem>
            <SelectItem value="rejected">Afvist</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-white/10 border-purple-500/20">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-purple-500/20">
                <TableHead className="text-gray-300">Ansøger</TableHead>
                <TableHead className="text-gray-300">Formular</TableHead>
                <TableHead className="text-gray-300">Indsendt</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Handlinger</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission) => (
                <TableRow key={submission.id} className="border-purple-500/20">
                  <TableCell className="text-white font-medium">
                    {submission.applicant_name}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {/* We'll need to fetch form details or pass them in */}
                    Ansøgning ID: {submission.form_id.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {new Date(submission.submitted_at).toLocaleDateString('da-DK')}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(submission.status)}>
                      {getStatusText(submission.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewSubmission(submission.id)}
                        className="border-purple-500 text-purple-300"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {submission.status === 'pending' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUpdateStatus(submission.id, 'approved')}
                            className="border-green-500 text-green-300 hover:bg-green-500/20"
                          >
                            Godkend
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUpdateStatus(submission.id, 'rejected')}
                            className="border-red-500 text-red-300 hover:bg-red-500/20"
                          >
                            Afvis
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredSubmissions.length === 0 && (
        <Card className="bg-white/10 border-purple-500/20 text-white">
          <CardContent className="p-8 text-center">
            <p className="text-gray-400">Ingen ansøgninger fundet</p>
          </CardContent>
        </Card>
      )}

      {/* View Submission Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-gray-900 border-purple-500/20 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ansøgningsdetaljer</DialogTitle>
            <DialogDescription className="text-gray-300">
              Gennemse ansøgningssvar og opdater status
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Ansøger</Label>
                  <p className="text-white font-semibold">{selectedSubmission.applicant_name}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Status</Label>
                  <Badge className={getStatusColor(selectedSubmission.status)}>
                    {getStatusText(selectedSubmission.status)}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-gray-400">Indsendt</Label>
                <p className="text-white">
                  {new Date(selectedSubmission.submitted_at).toLocaleString('da-DK')}
                </p>
              </div>
              
              <Separator className="bg-purple-500/20" />
              
              <div>
                <Label className="text-white text-lg mb-4 block">Ansøgningssvar</Label>
                <div className="space-y-4">
                  {Object.entries(selectedSubmission.responses).map(([fieldId, response]) => (
                    <div key={fieldId} className="p-4 bg-white/5 rounded-lg">
                      <Label className="text-gray-400">Felt ID: {fieldId}</Label>
                      <p className="text-white mt-1">
                        {Array.isArray(response) ? response.join(', ') : response}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator className="bg-purple-500/20" />
              
              <div className="flex justify-between">
                <Button 
                  onClick={() => setIsViewDialogOpen(false)}
                  variant="outline"
                  className="border-gray-500 text-gray-300"
                >
                  Luk
                </Button>
                
                <div className="flex space-x-2">
                  {selectedSubmission.status !== 'approved' && (
                    <Button 
                      onClick={() => handleUpdateStatus(selectedSubmission.id, 'approved')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Godkend
                    </Button>
                  )}
                  {selectedSubmission.status !== 'rejected' && (
                    <Button 
                      onClick={() => handleUpdateStatus(selectedSubmission.id, 'rejected')}
                      variant="destructive"
                    >
                      Afvis
                    </Button>
                  )}
                  {selectedSubmission.status !== 'pending' && (
                    <Button 
                      onClick={() => handleUpdateStatus(selectedSubmission.id, 'pending')}
                      variant="outline"
                      className="border-yellow-500 text-yellow-300 hover:bg-yellow-500/20"
                    >
                      Marker som afventende
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Changelog Manager Component
const ChangelogManager = () => {
  const [changelogsState, setChangelogsState] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingChangelog, setEditingChangelog] = useState(null);
  const [newChangelog, setNewChangelog] = useState({
    title: '',
    content: '',
    version: ''
  });

  useEffect(() => {
    fetchChangelogsList();
  }, []);

  const fetchChangelogsList = () => {
    try {
      const logs = getChangelogs().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setChangelogsState(logs);
    } catch (error) {
      console.error('Failed to fetch changelogs:', error);
    }
  };

  const handleCreateChangelog = async () => {
    try {
      const changelogs = getChangelogs();
      const newChangelogWithId = {
        id: `changelog-${Date.now()}`,
        ...newChangelog,
        created_at: new Date().toISOString(),
        created_by: "admin"
      };
      
      changelogs.push(newChangelogWithId);
      setChangelogs(changelogs);
      
      setIsCreateDialogOpen(false);
      setNewChangelog({ title: '', content: '', version: '' });
      fetchChangelogsList();
    } catch (error) {
      console.error('Failed to create changelog:', error);
      alert('Fejl ved oprettelse af changelog');
    }
  };

  const handleEditChangelog = async () => {
    try {
      const changelogs = getChangelogs();
      const changelogIndex = changelogs.findIndex(log => log.id === editingChangelog.id);
      
      if (changelogIndex !== -1) {
        changelogs[changelogIndex] = {
          ...changelogs[changelogIndex],
          title: editingChangelog.title,
          content: editingChangelog.content,
          version: editingChangelog.version
        };
        setChangelogs(changelogs);
      }
      
      setIsEditDialogOpen(false);
      setEditingChangelog(null);
      fetchChangelogsList();
    } catch (error) {
      console.error('Failed to update changelog:', error);
      alert('Fejl ved opdatering af changelog');
    }
  };

  const handleDeleteChangelog = async (changelogId) => {
    if (!window.confirm('Er du sikker på, at du vil slette denne changelog?')) return;
    
    try {
      const changelogs = getChangelogs();
      const filteredLogs = changelogs.filter(log => log.id !== changelogId);
      setChangelogs(filteredLogs);
      fetchChangelogsList();
    } catch (error) {
      console.error('Failed to delete changelog:', error);
      alert('Fejl ved sletning af changelog');
    }
  };

  const openEditDialog = (changelog) => {
    setEditingChangelog({ ...changelog });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Changelog Styring</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Ny Changelog
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-purple-500/20 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Opret ny changelog</DialogTitle>
              <DialogDescription className="text-gray-300">
                Tilføj en ny opdatering til changelog
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Titel</Label>
                  <Input
                    value={newChangelog.title}
                    onChange={(e) => setNewChangelog({...newChangelog, title: e.target.value})}
                    className="bg-white/5 border-purple-500/30 text-white"
                    placeholder="Opdateringstitel"
                  />
                </div>
                
                <div>
                  <Label className="text-white">Version (valgfri)</Label>
                  <Input
                    value={newChangelog.version}
                    onChange={(e) => setNewChangelog({...newChangelog, version: e.target.value})}
                    className="bg-white/5 border-purple-500/30 text-white"
                    placeholder="1.0.0"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-white">Indhold</Label>
                <Textarea
                  value={newChangelog.content}
                  onChange={(e) => setNewChangelog({...newChangelog, content: e.target.value})}
                  className="bg-white/5 border-purple-500/30 text-white"
                  rows={8}
                  placeholder="Beskriv ændringerne i denne opdatering..."
                />
              </div>
              
              <div className="flex space-x-4">
                <Button 
                  onClick={() => setIsCreateDialogOpen(false)} 
                  variant="outline"
                  className="flex-1 border-gray-500 text-gray-300"
                >
                  Annuller
                </Button>
                <Button 
                  onClick={handleCreateChangelog}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  disabled={!newChangelog.title || !newChangelog.content}
                >
                  Opret changelog
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {changelogsState.map((changelog) => (
          <Card key={changelog.id} className="bg-white/10 border-purple-500/20 text-white">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <CardTitle className="text-xl">{changelog.title}</CardTitle>
                    {changelog.version && (
                      <Badge variant="outline" className="border-purple-500 text-purple-300">
                        v{changelog.version}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-gray-400">
                    {new Date(changelog.created_at).toLocaleDateString('da-DK')} - {changelog.created_by}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openEditDialog(changelog)}
                    className="border-purple-500 text-purple-300"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteChangelog(changelog.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-200 whitespace-pre-line">{changelog.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {changelogsState.length === 0 && (
        <Card className="bg-white/10 border-purple-500/20 text-white">
          <CardContent className="p-8 text-center">
            <p className="text-gray-400">Ingen changelogs oprettet endnu</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-900 border-purple-500/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rediger changelog</DialogTitle>
            <DialogDescription className="text-gray-300">
              Opdater changelog indholdet
            </DialogDescription>
          </DialogHeader>
          
          {editingChangelog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Titel</Label>
                  <Input
                    value={editingChangelog.title}
                    onChange={(e) => setEditingChangelog({...editingChangelog, title: e.target.value})}
                    className="bg-white/5 border-purple-500/30 text-white"
                  />
                </div>
                
                <div>
                  <Label className="text-white">Version (valgfri)</Label>
                  <Input
                    value={editingChangelog.version || ''}
                    onChange={(e) => setEditingChangelog({...editingChangelog, version: e.target.value})}
                    className="bg-white/5 border-purple-500/30 text-white"
                    placeholder="1.0.0"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-white">Indhold</Label>
                <Textarea
                  value={editingChangelog.content}
                  onChange={(e) => setEditingChangelog({...editingChangelog, content: e.target.value})}
                  className="bg-white/5 border-purple-500/30 text-white"
                  rows={8}
                />
              </div>
              
              <div className="flex space-x-4">
                <Button 
                  onClick={() => setIsEditDialogOpen(false)} 
                  variant="outline"
                  className="flex-1 border-gray-500 text-gray-300"
                >
                  Annuller
                </Button>
                <Button 
                  onClick={handleEditChangelog}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  disabled={!editingChangelog.title || !editingChangelog.content}
                >
                  Gem ændringer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// User Manager Component
const UserManager = ({ applications }) => {
  const [users, setUsersState] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'staff',
    allowed_forms: []
  });

  useEffect(() => {
    fetchUsersList();
  }, []);

  const fetchUsersList = () => {
    try {
      const usersList = getUsers();
      setUsersState(usersList);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleCreateUser = async () => {
    try {
      const users = getUsers();
      
      // Check if username exists
      if (users.find(user => user.username === newUser.username)) {
        alert('Brugernavn eksisterer allerede');
        return;
      }
      
      const newUserWithId = {
        id: `user-${Date.now()}`,
        ...newUser,
        password_hash: newUser.password, // In real app, this would be hashed
        created_at: new Date().toISOString(),
        created_by: "admin"
      };
      
      users.push(newUserWithId);
      setUsers(users);
      
      setIsCreateDialogOpen(false);
      setNewUser({ username: '', password: '', role: 'staff', allowed_forms: [] });
      fetchUsersList();
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Fejl ved oprettelse af bruger');
    }
  };

  const handleEditUser = async () => {
    try {
      const users = getUsers();
      const userIndex = users.findIndex(user => user.id === editingUser.id);
      
      if (userIndex !== -1) {
        const updateData = {
          username: editingUser.username,
          allowed_forms: editingUser.allowed_forms
        };
        
        // Only include password if it's been changed
        if (editingUser.newPassword) {
          updateData.password_hash = editingUser.newPassword;
        }
        
        users[userIndex] = { ...users[userIndex], ...updateData };
        setUsers(users);
      }
      
      setIsEditDialogOpen(false);
      setEditingUser(null);
      fetchUsersList();
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Fejl ved opdatering af bruger');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Er du sikker på, at du vil slette denne bruger?')) return;
    
    try {
      const users = getUsers();
      const userToDelete = users.find(user => user.id === userId);
      
      if (userToDelete && userToDelete.username === 'admin') {
        alert('Kan ikke slette standard admin konto');
        return;
      }
      
      const filteredUsers = users.filter(user => user.id !== userId);
      setUsers(filteredUsers);
      fetchUsersList();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Fejl ved sletning af bruger');
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const users = getUsers();
      const userIndex = users.findIndex(user => user.id === userId);
      
      if (userIndex !== -1) {
        users[userIndex].role = newRole;
        setUsers(users);
        fetchUsersList();
      }
    } catch (error) {
      console.error('Failed to update role:', error);
      alert('Fejl ved opdatering af rolle');
    }
  };

  const openEditDialog = (user) => {
    setEditingUser({ 
      ...user,
      newPassword: '', // Add field for new password
      allowed_forms: user.allowed_forms || [] 
    });
    setIsEditDialogOpen(true);
  };

  const handleFormPermissionToggle = (formId, isEditing = false) => {
    if (isEditing) {
      setEditingUser(prev => ({
        ...prev,
        allowed_forms: prev.allowed_forms.includes(formId)
          ? prev.allowed_forms.filter(id => id !== formId)
          : [...prev.allowed_forms, formId]
      }));
    } else {
      setNewUser(prev => ({
        ...prev,
        allowed_forms: prev.allowed_forms.includes(formId)
          ? prev.allowed_forms.filter(id => id !== formId)
          : [...prev.allowed_forms, formId]
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Brugerstyring</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Ny Bruger
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-purple-500/20 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Opret ny bruger</DialogTitle>
              <DialogDescription className="text-gray-300">
                Opret en ny admin eller medarbejder
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Brugernavn</Label>
                  <Input
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    className="bg-white/5 border-purple-500/30 text-white"
                  />
                </div>
                
                <div>
                  <Label className="text-white">Adgangskode</Label>
                  <Input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="bg-white/5 border-purple-500/30 text-white"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-white">Rolle</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                  <SelectTrigger className="bg-white/5 border-purple-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="staff">Medarbejder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {newUser.role === 'staff' && (
                <div>
                  <Label className="text-white mb-3 block">Tilladte formularer</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {applications.map((app) => (
                      <div key={app.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`form-${app.id}`}
                          checked={newUser.allowed_forms.includes(app.id)}
                          onChange={() => handleFormPermissionToggle(app.id)}
                          className="rounded"
                        />
                        <Label htmlFor={`form-${app.id}`} className="text-gray-300 text-sm">
                          {app.title} ({app.position})
                        </Label>
                      </div>
                    ))}
                  </div>
                  {applications.length === 0 && (
                    <p className="text-gray-400 text-sm">Ingen formularer tilgængelige</p>
                  )}
                </div>
              )}
              
              <div className="flex space-x-4">
                <Button 
                  onClick={() => setIsCreateDialogOpen(false)} 
                  variant="outline"
                  className="flex-1 border-gray-500 text-gray-300"
                >
                  Annuller
                </Button>
                <Button 
                  onClick={handleCreateUser}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  disabled={!newUser.username || !newUser.password}
                >
                  Opret bruger
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white/10 border-purple-500/20">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-purple-500/20">
                <TableHead className="text-gray-300">Brugernavn</TableHead>
                <TableHead className="text-gray-300">Rolle</TableHead>
                <TableHead className="text-gray-300">Oprettet</TableHead>
                <TableHead className="text-gray-300">Tilladte formularer</TableHead>
                <TableHead className="text-gray-300">Handlinger</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="border-purple-500/20">
                  <TableCell className="text-white font-medium">
                    {user.username}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={user.role === 'admin' 
                        ? 'bg-purple-600/20 text-purple-300' 
                        : 'bg-blue-600/20 text-blue-300'
                      }
                    >
                      {user.role === 'admin' ? 'Administrator' : 'Medarbejder'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {new Date(user.created_at).toLocaleDateString('da-DK')}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {user.role === 'admin' ? (
                      <span className="text-green-400">Alle formularer</span>
                    ) : (
                      <span>{user.allowed_forms?.length || 0} formularer</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openEditDialog(user)}
                        className="border-purple-500 text-purple-300"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {user.username !== 'admin' && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-900 border-purple-500/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rediger bruger</DialogTitle>
            <DialogDescription className="text-gray-300">
              Opdater brugerens oplysninger og rettigheder
            </DialogDescription>
          </DialogHeader>
          
          {editingUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Brugernavn</Label>
                  <Input
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                    className="bg-white/5 border-purple-500/30 text-white"
                  />
                </div>
                
                <div>
                  <Label className="text-white">Ny adgangskode (lad stå tom for ikke at ændre)</Label>
                  <Input
                    type="password"
                    value={editingUser.newPassword || ''}
                    onChange={(e) => setEditingUser({...editingUser, newPassword: e.target.value})}
                    className="bg-white/5 border-purple-500/30 text-white"
                    placeholder="Lad stå tom for at beholde nuværende"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-gray-400">Rolle</Label>
                <p className="text-white font-semibold">
                  {editingUser.role === 'admin' ? 'Administrator' : 'Medarbejder'}
                </p>
              </div>
              
              {editingUser.role === 'staff' && (
                <div>
                  <Label className="text-white mb-3 block">Tilladte formularer</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {applications.map((app) => (
                      <div key={app.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`edit-form-${app.id}`}
                          checked={editingUser.allowed_forms.includes(app.id)}
                          onChange={() => handleFormPermissionToggle(app.id, true)}
                          className="rounded"
                        />
                        <Label htmlFor={`edit-form-${app.id}`} className="text-gray-300 text-sm">
                          {app.title} ({app.position})
                        </Label>
                      </div>
                    ))}
                  </div>
                  {applications.length === 0 && (
                    <p className="text-gray-400 text-sm">Ingen formularer tilgængelige</p>
                  )}
                </div>
              )}
              
              <div className="flex space-x-4">
                <Button 
                  onClick={() => setIsEditDialogOpen(false)} 
                  variant="outline"
                  className="flex-1 border-gray-500 text-gray-300"
                >
                  Annuller
                </Button>
                <Button 
                  onClick={handleEditUser}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  disabled={!editingUser.username}
                >
                  Gem ændringer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/admin" />;
  }
  
  if (requireAdmin && !user?.is_admin) {
    return <Navigate to="/admin/dashboard" />;
  }
  
  return children;
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/apply/:id" element={<ApplicationForm />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;