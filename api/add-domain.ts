export default async function handler(
    request: any,
    response: any
) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    const { subdomain, domain } = request.body;

    // Use either subdomain (to construct domain) or full domain
    const domainToAdd = domain || (subdomain ? `${subdomain}.careos.cloud` : null);

    if (!domainToAdd) {
        return response.status(400).json({ error: 'Domain or subdomain is required' });
    }

    const projectId = process.env.VERCEL_PROJECT_ID;
    const teamId = process.env.VERCEL_TEAM_ID;
    const token = process.env.VERCEL_API_TOKEN;

    if (!projectId || !token) {
        console.error('Missing Vercel configuration');
        return response.status(500).json({ error: 'Server configuration error' });
    }

    try {
        const url = `https://api.vercel.com/v9/projects/${projectId}/domains${teamId ? `?teamId=${teamId}` : ''}`;

        const vercelResponse = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: domainToAdd,
            }),
        });

        const data = await vercelResponse.json();

        if (!vercelResponse.ok) {
            console.error('Vercel API error:', data);
            return response.status(vercelResponse.status).json({ error: data.error?.message || 'Failed to add domain' });
        }

        return response.status(200).json({ success: true, domain: data });
    } catch (error: any) {
        console.error('Error adding domain:', error);
        return response.status(500).json({ error: error.message || 'Internal server error' });
    }
}
