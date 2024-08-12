const reqs:string[] = []
const serve = Bun.serve({
    fetch(req, server) {
        reqs.push(Math.random().toString())
        console.log('ok')
        return new Response(JSON.stringify(reqs), { status: 200})
    }
})