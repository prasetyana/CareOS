
if (!subdomain) {
    return response.status(400).json({ error: 'Subdomain is required' });
}

const projectId = process.env.VERCEL_PROJECT_ID;
const teamId = process.env.VERCEL_TEAM_ID;
const token = process.env.VERCEL_API_TOKEN;

if (!projectId || !token) {
    console.error('Missing Vercel configuration');
    return response.status(500).json({ error: 'Server configuration error' });
}

try {
    // Add domain to Vercel project
    // https://vercel.com/docs/rest-api/endpoints#add-a-project-domain
    const domain = `${subdomain}.careos.cloud`; // Or use environment var for base domain

    // Note: If you want to support staging.careos.cloud subdomains too, 
    // you might need logic to determine the base domain. 
    // For now, we'll assume the subdomain passed includes the full domain or we construct it.
    // Actually, it's safer to pass the FULL domain from the client.

    const domainToAdd = request.body.domain || `${subdomain}.careos.cloud`;

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
