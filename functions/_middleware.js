export async function onRequest(context) {
    const url = new URL(context.request.url);
    const path = url.pathname.slice(1);

    if (path && path !== 'style.css' && path !== 'script.js' && !path.includes('.')) {
        url.pathname = '/';
        url.searchParams.set('key', path);
        return Response.redirect(url.toString(), 302);
    }

    return context.next();
}
