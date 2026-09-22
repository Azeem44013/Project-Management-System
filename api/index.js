const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

function errorResponse(res, status, message) {
	return res.status(status).json({ error: message instanceof Error ? message.message : message });
}

module.exports = async function handler(req, res) {
	const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
	if (!SUPABASE_URL || !SUPABASE_KEY) return errorResponse(res, 500, 'Supabase not configured');
	if (!token) return errorResponse(res, 401, 'Authentication required');

	const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
		global: { headers: { Authorization: `Bearer ${token}` } },
	});
	const path = String(req.query.path || '').replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
	const [resource, id, child] = path;
	const body = req.body || {};

	try {
		if (resource === 'projects' && !id && req.method === 'GET') {
			const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
			if (error) return errorResponse(res, 500, error);
			return res.status(200).json(data);
		}
		if (resource === 'projects' && !id && req.method === 'POST') {
			const { data, error } = await supabase.from('projects').insert(body).select().single();
			if (error) return errorResponse(res, 500, error);
			return res.status(201).json(data);
		}
		if (resource === 'projects' && id && child === 'tasks' && req.method === 'GET') {
			const { data, error } = await supabase.from('tasks').select('*').eq('project_id', id).order('created_at', { ascending: false });
			if (error) return errorResponse(res, 500, error);
			return res.status(200).json(data);
		}
		if (resource === 'projects' && id && !child) {
			if (req.method === 'GET') {
				const { data, error } = await supabase.from('projects').select('*').eq('id', id).maybeSingle();
				if (error) return errorResponse(res, 500, error);
				if (!data) return errorResponse(res, 404, 'Project not found');
				return res.status(200).json(data);
			}
			if (req.method === 'PUT') {
				const { data, error } = await supabase.from('projects').update(body).eq('id', id).select().single();
				if (error) return errorResponse(res, 500, error);
				return res.status(200).json(data);
			}
			if (req.method === 'DELETE') {
				const { error } = await supabase.from('projects').delete().eq('id', id);
				if (error) return errorResponse(res, 500, error);
				return res.status(204).end();
			}
		}
		if (resource === 'tasks' && !id && req.method === 'GET') {
			const { data, error } = await supabase.from('tasks').select('*, projects(*)').order('created_at', { ascending: false });
			if (error) return errorResponse(res, 500, error);
			return res.status(200).json(data);
		}
		if (resource === 'tasks' && !id && req.method === 'POST') {
			const { data, error } = await supabase.from('tasks').insert(body).select().single();
			if (error) return errorResponse(res, 500, error);
			return res.status(201).json(data);
		}
		if (resource === 'tasks' && id && req.method === 'PUT') {
			const { data, error } = await supabase.from('tasks').update(body).eq('id', id).select().single();
			if (error) return errorResponse(res, 500, error);
			return res.status(200).json(data);
		}
		if (resource === 'tasks' && id && req.method === 'DELETE') {
			const { error } = await supabase.from('tasks').delete().eq('id', id);
			if (error) return errorResponse(res, 500, error);
			return res.status(204).end();
		}
		return errorResponse(res, 404, 'Not found');
	} catch (error) {
		return errorResponse(res, 500, error);
	}
};
