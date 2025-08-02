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
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { Users, Server, Settings, FileText, Plus, Eye, Trash2, Edit, MessageSquare, LogOut } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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
      axios.get(`${API}/user/me`, {
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
  const [news, setNews] = useState([]);
  const [changelogs, setChangelogs] = useState([]);

  useEffect(() => {
    const fetchServerStats = async () => {
      try {
        const response = await axios.get(`${API}/server-stats`);
        setServerStats(response.data);
      } catch (error) {
        console.error("Failed to fetch server stats:", error);
      }
    };

    const fetchApplications = async () => {
      try {
        const response = await axios.get(`${API}/applications`);
        setApplications(response.data);
      } catch (error) {
        console.error("Failed to fetch applications:", error);
      }
    };

    const fetchNews = async () => {
      try {
        const response = await axios.get(`${API}/discord/news`);
        setNews(response.data.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch news:", error);
      }
    };

    const fetchChangelogs = async () => {
      try {
        const response = await axios.get(`${API}/changelogs`);
        setChangelogs(response.data.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch changelogs:", error);
      }
    };

    fetchServerStats();
    fetchApplications();
    fetchNews();
    fetchChangelogs();

    const interval = setInterval(() => {
      fetchServerStats();
      fetchApplications();
      fetchNews();
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
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-3">
              Discord Server
            </Button>
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

      {/* News and Updates Section */}
      <section className="py-20 bg-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Discord News */}
            <div>
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-white mb-4">Seneste Nyheder</h3>
                <p className="text-gray-300">Opdateringer fra vores Discord</p>
              </div>
              
              <div className="space-y-4">
                {news.map((item) => (
                  <Card key={item.id} className="bg-white/5 border-purple-500/20 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={item.author_avatar ? 
                              `https://cdn.discordapp.com/avatars/${item.id}/${item.author_avatar}.png` : 
                              undefined
                            } 
                          />
                          <AvatarFallback>{item.author_username.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-semibold text-purple-300">{item.author_username}</span>
                            <span className="text-sm text-gray-400">
                              {new Date(item.timestamp).toLocaleDateString('da-DK')}
                            </span>
                          </div>
                          <p className="text-gray-200">{item.content || "📎 Medie delt"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Changelogs */}
            <div>
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-white mb-4">Seneste Ændringer</h3>
                <p className="text-gray-300">Server opdateringer og forbedringer</p>
              </div>
              
              <div className="space-y-4">
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
            </div>
          </div>
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
        const response = await axios.get(`${API}/applications/${formId}`);
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
      await axios.post(`${API}/applications/submit`, {
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
      const response = await axios.post(`${API}/admin/login`, credentials);
      const userData = { 
        username: credentials.username, 
        type: 'admin', 
        role: response.data.role,
        is_admin: response.data.role === 'admin',
        is_staff: ['admin', 'staff'].includes(response.data.role)
      };
      login(response.data.access_token, userData);
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
      const response = await axios.get(`${API}/admin/application-forms`, {
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
      const response = await axios.get(`${API}/admin/submissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubmissions(response.data);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    }
  };

  const fetchServerStats = async () => {
    try {
      const response = await axios.get(`${API}/server-stats`);
      setServerStats(response.data);
    } catch (error) {
      console.error('Failed to fetch server stats:', error);
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
      await axios.post(`${API}/admin/application-forms`, newForm, {
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
      await axios.put(`${API}/admin/application-forms/${editingForm.id}`, {
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
    if (!confirm('Er du sikker på, at du vil slette denne ansøgningsformular?')) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      await axios.delete(`${API}/admin/application-forms/${formId}`, {
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
  return <div className="text-white">Submission Manager - Implementation continues</div>;
};

// Changelog Manager Component
const ChangelogManager = () => {
  return <div className="text-white">Changelog Manager - Implementation continues</div>;
};

// User Manager Component
const UserManager = ({ applications }) => {
  return <div className="text-white">User Manager - Implementation continues</div>;
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