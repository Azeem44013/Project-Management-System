require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  if (!req.url.startsWith('/api')) return next();
  req.url = req.url.replace(/^\/api(?=\/|$)/, '') || '/';
  next();
});

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn('Missing supabase env vars. Set SUPABASE_URL and SUPABASE_SERVICE_KEY');
} else {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

function getSupabaseForRequest(req) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

function requireSupabase(req, res, next) {
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
  req.supabase = getSupabaseForRequest(req);
  if (!req.supabase) return res.status(401).json({ error: 'Authentication required' });
  next();
}

app.get('/health', (req, res) => res.json({ ok: true }));

app.post('/auth/register', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
  const { email, password, fullName } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/auth/login', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/auth/logout', requireSupabase, async (req, res) => {
  try {
    const { error } = await req.supabase.auth.signOut();
    if (error) return res.status(400).json({ error: error.message });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Projects
app.get('/projects', requireSupabase, async (req, res) => {
  try {
    const { data, error } = await req.supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/projects/:id', requireSupabase, async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await req.supabase.from('projects').select('*').eq('id', id).maybeSingle();
    if (!data && !error) return res.status(404).json({ error: 'Project not found' });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tasks
app.post('/projects', requireSupabase, async (req, res) => {
  try {
    const { data, error } = await req.supabase.from('projects').insert(req.body).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/projects/:id', requireSupabase, async (req, res) => {
  try {
    const { data, error } = await req.supabase.from('projects').update(req.body).eq('id', req.params.id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/projects/:id', requireSupabase, async (req, res) => {
  try {
    const { error } = await req.supabase.from('projects').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/tasks', requireSupabase, async (req, res) => {
  try {
    const { data, error } = await req.supabase.from('tasks').select('*, projects(*)').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/tasks/:id', requireSupabase, async (req, res) => {
  try {
    const { data, error } = await req.supabase.from('tasks').select('*, projects(*)').eq('id', req.params.id).maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Task not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/projects/:id/tasks', requireSupabase, async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await req.supabase.from('tasks').select('*').eq('project_id', id).order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/tasks', requireSupabase, async (req, res) => {
  const input = req.body;
  try {
    const { data, error } = await req.supabase.from('tasks').insert(input).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/tasks/:id', requireSupabase, async (req, res) => {
  const { id } = req.params;
  const input = req.body;
  try {
    const { data, error } = await req.supabase.from('tasks').update(input).eq('id', id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/tasks/:id', requireSupabase, async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await req.supabase.from('tasks').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use(express.static(path.join(__dirname, '..', 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
