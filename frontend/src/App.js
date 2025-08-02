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
    // Fetch server stats
    const fetchServerStats = async () => {
      try {
        const response = await axios.get(`${API}/server-stats`);
        setServerStats(response.data);
      } catch (error) {
        console.error("Failed to fetch server stats:", error);
      }
    };

    // Fetch public applications
    const fetchApplications = async () => {
      try {
        const response = await axios.get(`${API}/applications`);
        setApplications(response.data);
      } catch (error) {
        console.error("Failed to fetch applications:", error);
      }
    };

    // Fetch Discord news
    const fetchNews = async () => {
      try {
        const response = await axios.get(`${API}/discord/news`);
        setNews(response.data.slice(0, 5)); // Show latest 5 news
      } catch (error) {
        console.error("Failed to fetch news:", error);
      }
    };

    // Fetch changelogs
    const fetchChangelogs = async () => {
      try {
        const response = await axios.get(`${API}/changelogs`);
        setChangelogs(response.data.slice(0, 3)); // Show latest 3 changelogs
      } catch (error) {
        console.error("Failed to fetch changelogs:", error);
      }
    };

    fetchServerStats();
    fetchApplications();
    fetchNews();
    fetchChangelogs();

    // Auto-refresh every 30 seconds
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

// Discord Login Page
const DiscordLogin = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a code from Discord callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      setLoading(true);
      axios.get(`${API}/auth/discord/callback?code=${code}`)
        .then(response => {
          const userData = response.data.user;
          userData.is_admin = response.data.is_admin; // Ensure is_admin is in user object
          login(response.data.access_token, userData);
          
          // Always redirect to homepage - user will see appropriate buttons based on role
          navigate('/');
        })
        .catch(error => {
          console.error('Discord login failed:', error);
          alert('Login fejlede, prøv igen');
          setLoading(false);
          navigate('/login');
        });
    }
  }, [login, navigate]);

  const handleDiscordLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/auth/discord/login`);
      window.location.href = response.data.login_url;
    } catch (error) {
      console.error('Failed to initiate Discord login:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <Card className="w-full max-w-md bg-white/10 border-purple-500/20">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-white">Logger ind med Discord...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Card className="w-full max-w-md bg-white/10 border-purple-500/20">
        <CardHeader className="text-center">
          <img 
            src="https://customer-assets.emergentagent.com/job_e66817cd-11b4-4986-8bb5-ab2fe06c620d/artifacts/ag8fwiri_Revolution.png" 
            alt="Revolution RP" 
            className="h-16 w-16 mx-auto mb-4"
          />
          <CardTitle className="text-2xl text-white">Log ind med Discord</CardTitle>
          <CardDescription className="text-gray-300">Brug din Discord konto for at få adgang</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleDiscordLogin}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {loading ? 'Logger ind...' : 'Login med Discord'}
          </Button>
          
          <div className="mt-4 text-center">
            <Link to="/admin" className="text-purple-400 hover:text-purple-300 text-sm">
              Admin login (legacy)
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// User Dashboard
const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [myApplications, setMyApplications] = useState([]);

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API}/user/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyApplications(response.data);
    } catch (error) {
      console.error('Failed to fetch user applications:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-400/20';
      case 'rejected': return 'text-red-400 bg-red-400/20';
      default: return 'text-yellow-400 bg-yellow-400/20';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Godkendt';
      case 'rejected': return 'Afvist';
      default: return 'Afventer';
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
            <h1 className="text-xl font-bold text-white">Mit Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage 
                    src={user.discord_avatar ? 
                      `https://cdn.discordapp.com/avatars/${user.discord_id}/${user.discord_avatar}.png` : 
                      undefined
                    } 
                  />
                  <AvatarFallback>{user.discord_username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-white">{user.discord_username}</span>
              </div>
            )}
            <Button onClick={logout} variant="outline" className="border-red-500 text-red-300 hover:bg-red-500/20">
              <LogOut className="h-4 w-4 mr-2" />
              Log ud
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* User Profile */}
          <Card className="bg-white/10 border-purple-500/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Min Profil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage 
                    src={user?.discord_avatar ? 
                      `https://cdn.discordapp.com/avatars/${user.discord_id}/${user.discord_avatar}.png` : 
                      undefined
                    } 
                  />
                  <AvatarFallback>{user?.discord_username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{user?.discord_username}</p>
                  <p className="text-sm text-gray-400">Discord Bruger</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-400">Status:</span> {user?.is_admin ? 'Administrator' : 'Bruger'}</div>
                <div><span className="text-gray-400">Medlem siden:</span> {new Date(user?.created_at).toLocaleDateString('da-DK')}</div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white/10 border-purple-500/20 text-white">
            <CardHeader>
              <CardTitle>Hurtige Handlinger</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/" className="block">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Se Tilgængelige Ansøgninger
                </Button>
              </Link>
              {user?.is_admin && (
                <Link to="/admin" className="block">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin Panel
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Application Stats */}
          <Card className="bg-white/10 border-purple-500/20 text-white">
            <CardHeader>
              <CardTitle>Mine Ansøgninger</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400 mb-2">{myApplications.length}</div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-green-400">Godkendt: </span>
                  {myApplications.filter(app => app.status === 'approved').length}
                </div>
                <div>
                  <span className="text-yellow-400">Afventer: </span>
                  {myApplications.filter(app => app.status === 'pending').length}
                </div>
                <div>
                  <span className="text-red-400">Afvist: </span>
                  {myApplications.filter(app => app.status === 'rejected').length}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications Table */}
        <Card className="bg-white/10 border-purple-500/20 text-white mt-8">
          <CardHeader>
            <CardTitle>Mine Ansøgninger</CardTitle>
            <CardDescription className="text-gray-300">
              Oversigt over alle dine ansøgninger og deres status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {myApplications.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-purple-500/20">
                    <TableHead className="text-white">Ansøgning</TableHead>
                    <TableHead className="text-white">Indsendt</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myApplications.map((application) => (
                    <TableRow key={application.id} className="border-purple-500/20 text-white">
                      <TableCell className="font-medium">{application.form_id.slice(0, 8)}...</TableCell>
                      <TableCell>{new Date(application.submitted_at).toLocaleDateString('da-DK')}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(application.status)} border-0`}>
                          {getStatusText(application.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-4">Du har ingen ansøgninger endnu</p>
                <Link to="/">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Gennemse Ansøgninger
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Application Form Page
const ApplicationForm = () => {
  const { id: formId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
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
        // Initialize responses
        const initialResponses = {};
        response.data.fields.forEach(field => {
          initialResponses[field.id] = field.field_type === 'checkbox' ? [] : '';
        });
        setResponses(initialResponses);
        
        // Pre-fill name if user is logged in
        if (user?.discord_username) {
          setApplicantName(user.discord_username);
        }
      } catch (error) {
        console.error("Failed to fetch form:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [formId, user]);

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

// Admin Dashboard (existing implementation continues...)
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
              Velkommen, {user?.discord_username || user?.username}
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
                  {user?.role === 'staff' ? 'Du har staff adgang - kan administrere indsendte ansøgninger' : 'Du har fuld admin adgang'}
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

// Application Manager Component - rest of the existing components remain the same...
const ApplicationManager = ({ applications, onUpdate }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    position: '',
    fields: [],
    webhook_url: ''
  });

  const fieldTypes = [
    { value: 'text', label: 'Tekst' },
    { value: 'textarea', label: 'Tekstboks' },
    { value: 'select', label: 'Dropdown' },
    { value: 'radio', label: 'Radio knapper' },
    { value: 'checkbox', label: 'Checkboxe' }
  ];

  const addField = () => {
    const newField = {
      id: Date.now().toString(),
      label: '',
      field_type: 'text',
      options: [],
      required: false,
      placeholder: ''
    };
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const updateField = (fieldId, updates) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  const removeField = (fieldId) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      const url = editingApp ? 
        `${API}/admin/application-forms/${editingApp.id}` : 
        `${API}/admin/application-forms`;
      const method = editingApp ? 'PUT' : 'POST';

      await axios({
        method,
        url,
        data: formData,
        headers: { Authorization: `Bearer ${token}` }
      });

      onUpdate();
      setIsCreating(false);
      setEditingApp(null);
      setFormData({ title: '', description: '', position: '', fields: [], webhook_url: '' });
    } catch (error) {
      console.error('Failed to save application:', error);
      alert('Fejl ved gem af ansøgning');
    }
  };

  const deleteApplication = async (id) => {
    if (confirm('Er du sikker på at du vil slette denne ansøgning?')) {
      try {
        const token = localStorage.getItem('auth_token');
        await axios.delete(`${API}/admin/application-forms/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        onUpdate();
      } catch (error) {
        console.error('Failed to delete application:', error);
      }
    }
  };

  const startEdit = (app) => {
    setEditingApp(app);
    setFormData(app);
    setIsCreating(true);
  };

  if (isCreating) {
    return (
      <Card className="bg-white/10 border-purple-500/20 text-white">
        <CardHeader>
          <CardTitle>{editingApp ? 'Rediger Ansøgning' : 'Opret Ny Ansøgning'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Titel</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="bg-white/5 border-purple-500/30 text-white"
                />
              </div>
              <div>
                <Label>Position</Label>
                <Input
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  required
                  className="bg-white/5 border-purple-500/30 text-white"
                  placeholder="f.eks. Staff, Moderator, Developer"
                />
              </div>
            </div>

            <div>
              <Label>Beskrivelse</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                className="bg-white/5 border-purple-500/30 text-white"
                rows={3}
              />
            </div>

            <div>
              <Label>Discord Webhook URL</Label>
              <Input
                value={formData.webhook_url}
                onChange={(e) => setFormData(prev => ({ ...prev, webhook_url: e.target.value }))}
                className="bg-white/5 border-purple-500/30 text-white"
                placeholder="https://discord.com/api/webhooks/..."
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <Label className="text-lg">Formular Felter</Label>
                <Button type="button" onClick={addField} size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Tilføj Felt
                </Button>
              </div>

              <div className="space-y-4">
                {formData.fields.map((field) => (
                  <Card key={field.id} className="bg-white/5 border-purple-500/20 p-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label>Label</Label>
                        <Input
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          className="bg-white/5 border-purple-500/30 text-white"
                        />
                      </div>
                      <div>
                        <Label>Felttype</Label>
                        <Select 
                          value={field.field_type} 
                          onValueChange={(value) => updateField(field.id, { field_type: value })}
                        >
                          <SelectTrigger className="bg-white/5 border-purple-500/30 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fieldTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end space-x-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(field.id, { required: e.target.checked })}
                            className="rounded"
                          />
                          <Label className="text-sm">Påkrævet</Label>
                        </div>
                        <Button
                          type="button"
                          onClick={() => removeField(field.id)}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {field.field_type === 'text' && (
                      <div className="mt-4">
                        <Label>Placeholder</Label>
                        <Input
                          value={field.placeholder || ''}
                          onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                          className="bg-white/5 border-purple-500/30 text-white"
                        />
                      </div>
                    )}

                    {(field.field_type === 'select' || field.field_type === 'radio') && (
                      <div className="mt-4">
                        <Label>Valgmuligheder (én per linje)</Label>
                        <Textarea
                          value={(field.options || []).join('\n')}
                          onChange={(e) => updateField(field.id, { 
                            options: e.target.value.split('\n').filter(opt => opt.trim()) 
                          })}
                          className="bg-white/5 border-purple-500/30 text-white"
                          placeholder="Mulighed 1\nMulighed 2\nMulighed 3"
                        />
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setEditingApp(null);
                  setFormData({ title: '', description: '', position: '', fields: [], webhook_url: '' });
                }}
                className="flex-1 border-gray-500 text-gray-300 hover:bg-gray-800"
              >
                Annuller
              </Button>
              <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
                {editingApp ? 'Opdater' : 'Opret'} Ansøgning
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Ansøgninger</h2>
        <Button onClick={() => setIsCreating(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Ny Ansøgning
        </Button>
      </div>

      <div className="grid gap-4">
        {applications.map((app) => (
          <Card key={app.id} className="bg-white/10 border-purple-500/20 text-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{app.title}</h3>
                  <p className="text-gray-300 mb-2">{app.description}</p>
                  <Badge variant="secondary" className="bg-purple-600/20 text-purple-300 mb-2">
                    {app.position}
                  </Badge>
                  <div className="text-sm text-gray-400">
                    {app.fields.length} felter • Oprettet {new Date(app.created_at).toLocaleDateString('da-DK')}
                  </div>
                  {app.webhook_url && (
                    <div className="text-sm text-green-400 mt-1">✓ Discord webhook konfigureret</div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => startEdit(app)}
                    size="sm"
                    variant="outline"
                    className="border-purple-500 text-purple-300 hover:bg-purple-500/20"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => deleteApplication(app.id)}
                    size="sm"
                    variant="destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Submission Manager Component - rest remains same as before...
const SubmissionManager = ({ submissions, onUpdate }) => {
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const updateStatus = async (submissionId, status) => {
    try {
      const token = localStorage.getItem('auth_token');
      await axios.put(`${API}/admin/submissions/${submissionId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onUpdate();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-400';
      case 'rejected': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Godkendt';
      case 'rejected': return 'Afvist';
      default: return 'Afventer';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Indsendte Ansøgninger</h2>

      <Card className="bg-white/10 border-purple-500/20">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-purple-500/20">
                <TableHead className="text-white">Navn</TableHead>
                <TableHead className="text-white">Ansøgning</TableHead>
                <TableHead className="text-white">Indsendt</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Handlinger</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id} className="border-purple-500/20 text-white">
                  <TableCell className="font-medium">{submission.applicant_name}</TableCell>
                  <TableCell>Form ID: {submission.form_id.slice(0, 8)}...</TableCell>
                  <TableCell>{new Date(submission.submitted_at).toLocaleDateString('da-DK')}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(submission.status)} bg-transparent border`}>
                      {getStatusText(submission.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => setSelectedSubmission(submission)}
                        size="sm"
                        variant="outline"
                        className="border-purple-500 text-purple-300 hover:bg-purple-500/20"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {submission.status === 'pending' && (
                        <>
                          <Button
                            onClick={() => updateStatus(submission.id, 'approved')}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Godkend
                          </Button>
                          <Button
                            onClick={() => updateStatus(submission.id, 'rejected')}
                            size="sm"
                            variant="destructive"
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

      {/* Submission Detail Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="bg-gray-900 border-purple-500/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ansøgningsdetaljer</DialogTitle>
            <DialogDescription className="text-gray-300">
              Ansøgning fra {selectedSubmission?.applicant_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {selectedSubmission && Object.entries(selectedSubmission.responses).map(([fieldId, response]) => (
              <div key={fieldId} className="p-4 bg-white/5 rounded-lg">
                <div className="text-sm text-gray-400 mb-2">Felt ID: {fieldId}</div>
                <div className="text-white">{Array.isArray(response) ? response.join(', ') : response}</div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Changelog Manager Component
const ChangelogManager = () => {
  const [changelogs, setChangelogs] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    version: ''
  });

  useEffect(() => {
    fetchChangelogs();
  }, []);

  const fetchChangelogs = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API}/admin/changelogs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChangelogs(response.data);
    } catch (error) {
      console.error('Failed to fetch changelogs:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      const url = editingLog ? 
        `${API}/admin/changelogs/${editingLog.id}` : 
        `${API}/admin/changelogs`;
      const method = editingLog ? 'PUT' : 'POST';

      await axios({
        method,
        url,
        data: formData,
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchChangelogs();
      setIsCreating(false);
      setEditingLog(null);
      setFormData({ title: '', content: '', version: '' });
    } catch (error) {
      console.error('Failed to save changelog:', error);
      alert('Fejl ved gem af changelog');
    }
  };

  const deleteChangelog = async (id) => {
    if (confirm('Er du sikker på at du vil slette denne changelog?')) {
      try {
        const token = localStorage.getItem('auth_token');
        await axios.delete(`${API}/admin/changelogs/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchChangelogs();
      } catch (error) {
        console.error('Failed to delete changelog:', error);
      }
    }
  };

  const startEdit = (log) => {
    setEditingLog(log);
    setFormData(log);
    setIsCreating(true);
  };

  if (isCreating) {
    return (
      <Card className="bg-white/10 border-purple-500/20 text-white">
        <CardHeader>
          <CardTitle>{editingLog ? 'Rediger Changelog' : 'Opret Ny Changelog'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Titel</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="bg-white/5 border-purple-500/30 text-white"
                  placeholder="f.eks. Server Opdatering"
                />
              </div>
              <div>
                <Label>Version (valgfri)</Label>
                <Input
                  value={formData.version}
                  onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                  className="bg-white/5 border-purple-500/30 text-white"
                  placeholder="f.eks. 2.1.0"
                />
              </div>
            </div>

            <div>
              <Label>Indhold</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                required
                className="bg-white/5 border-purple-500/30 text-white"
                rows={6}
                placeholder="Beskriv ændringerne..."
              />
            </div>

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setEditingLog(null);
                  setFormData({ title: '', content: '', version: '' });
                }}
                className="flex-1 border-gray-500 text-gray-300 hover:bg-gray-800"
              >
                Annuller
              </Button>
              <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
                {editingLog ? 'Opdater' : 'Opret'} Changelog
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Changelog Styring</h2>
        <Button onClick={() => setIsCreating(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Ny Changelog
        </Button>
      </div>

      <div className="grid gap-4">
        {changelogs.map((log) => (
          <Card key={log.id} className="bg-white/10 border-purple-500/20 text-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold">{log.title}</h3>
                    {log.version && (
                      <Badge variant="outline" className="border-purple-500 text-purple-300">
                        v{log.version}
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-300 mb-2 whitespace-pre-line">{log.content}</p>
                  <div className="text-sm text-gray-400">
                    Oprettet {new Date(log.created_at).toLocaleDateString('da-DK')} af {log.created_by}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => startEdit(log)}
                    size="sm"
                    variant="outline"
                    className="border-purple-500 text-purple-300 hover:bg-purple-500/20"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => deleteChangelog(log.id)}
                    size="sm"
                    variant="destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'staff' });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      await axios.post(`${API}/admin/create-user`, newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewUser({ username: '', password: '', role: 'staff' });
      await fetchUsers();
      alert(`${newUser.role === 'admin' ? 'Admin' : 'Staff'} bruger oprettet successfully!`);
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Fejl ved oprettelse af bruger - brugernavn findes muligvis allerede');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId, username) => {
    if (username === 'admin') {
      alert('Kan ikke slette standard admin bruger');
      return;
    }
    
    if (confirm(`Er du sikker på at du vil slette brugeren "${username}"?`)) {
      try {
        const token = localStorage.getItem('auth_token');
        await axios.delete(`${API}/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await fetchUsers();
        alert('Bruger slettet successfully!');
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert(error.response?.data?.detail || 'Fejl ved sletning af bruger');
      }
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('auth_token');
      await axios.put(`${API}/admin/users/${userId}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchUsers();
      alert('Brugerrolle opdateret successfully!');
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to update user role:', error);
      alert(error.response?.data?.detail || 'Fejl ved opdatering af rolle');
    }
  };

  const getRoleText = (role) => {
    return role === 'admin' ? 'Administrator' : 'Staff';
  };

  const getRoleBadgeVariant = (role) => {
    return role === 'admin' ? 'default' : 'secondary';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Brugerstyring</h2>

      <Card className="bg-white/10 border-purple-500/20 text-white">
        <CardHeader>
          <CardTitle>Opret Ny Bruger</CardTitle>
          <CardDescription className="text-gray-300">
            Opret admin eller staff brugere til at administrere ansøgninger
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={createUser} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Brugernavn</Label>
                <Input
                  value={newUser.username}
                  onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                  required
                  className="bg-white/5 border-purple-500/30 text-white"
                  placeholder="Indtast brugernavn"
                />
              </div>
              <div>
                <Label>Rolle</Label>
                <Select 
                  value={newUser.role} 
                  onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger className="bg-white/5 border-purple-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff (Kan administrere ansøgninger)</SelectItem>
                    <SelectItem value="admin">Admin (Fuld adgang)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Adgangskode</Label>
              <Input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                required
                className="bg-white/5 border-purple-500/30 text-white"
                placeholder="Indtast adgangskode"
              />
            </div>
            <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
              {loading ? 'Opretter...' : `Opret ${newUser.role === 'admin' ? 'Admin' : 'Staff'}`}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white/10 border-purple-500/20 text-white">
        <CardHeader>
          <CardTitle>Alle Brugere ({users.length})</CardTitle>
          <CardDescription className="text-gray-300">
            Administrer alle brugere i systemet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.length > 0 ? users.map((user) => (
              <Card key={user.id} className="bg-white/5 border-purple-500/30">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{user.username}</h3>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {getRoleText(user.role)}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-400 space-y-1">
                        <div>Oprettet: {new Date(user.created_at).toLocaleDateString('da-DK')}</div>
                        {user.created_by && user.created_by !== 'system' && (
                          <div>Oprettet af: {user.created_by}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {editingUser === user.id ? (
                        <div className="flex items-center space-x-2">
                          <Select 
                            defaultValue={user.role}
                            onValueChange={(newRole) => updateUserRole(user.id, newRole)}
                          >
                            <SelectTrigger className="w-32 bg-white/5 border-purple-500/30 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="staff">Staff</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            onClick={() => setEditingUser(null)}
                            size="sm"
                            variant="outline"
                            className="border-gray-500 text-gray-300 hover:bg-gray-800"
                          >
                            Annuller
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button
                            onClick={() => setEditingUser(user.id)}
                            size="sm"
                            variant="outline"
                            className="border-purple-500 text-purple-300 hover:bg-purple-500/20"
                            disabled={user.username === 'admin'}
                          >
                            <Edit className="h-4 w-4" />
                            Rediger Rolle
                          </Button>
                          <Button
                            onClick={() => deleteUser(user.id, user.username)}
                            size="sm"
                            variant="destructive"
                            disabled={user.username === 'admin'}
                          >
                            <Trash2 className="h-4 w-4" />
                            Slet
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="text-center py-8">
                <Users className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Ingen brugere fundet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/10 border-purple-500/20 text-white">
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div><strong>Staff Access:</strong> Kan se og administrere ansøgninger</div>
            <div><strong>Admin Access:</strong> Fuld adgang til alle funktioner</div>
            <div><strong>Standard Admin:</strong> admin / admin123 (kan ikke slettes)</div>
            <div><strong>FiveM Server API:</strong> http://45.84.198.57:30120/dynamic.json</div>
            <div><strong>Webhook Format:</strong> Discord</div>
          </div>
        </CardContent>
      </Card>
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
    // If admin required but user is only staff, redirect to admin dashboard with limited access
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