# ServiceWorker demo

This is a (partial) [ServiceWorker](https://github.com/slightlyoff/ServiceWorker) implementation, written in JavaScript. The idea is to enable exploration of the ServiceWorker API and the implications it has for users, applications and developer workflow.

## Setup

It's a bit complicated.

### Requirements

- Node + npm
- a proxy capable of modifying requests based on hostname, like [Charles](http://www.charlesproxy.com/) or hoxy – `npm install -g hoxy`)
- Possibly OSX – I haven't tried on other platforms

You'll need to be able host a local server and give it a different hostname than `localhost` - this will be your *network host*. I'd recommend `demosite-origin.dev`. You'll use `demosite.dev` (so, no `-origin` bit) to hit the service worker. This second host is your *local host*.

I built [`distra`](https://github.com/phuu/distra) which can do this, but there are other ways. You could also use a remote server (I think, not tried).

### Architecture

Here's the general idea.

1. Page requests something from *local origin*
2. Proxy redirects to ServiceWorker server
3. ServiceWorker worker which generates response
4. ServiceWorker might go to the *network origin*, pretending to be the page
5. ServiceWorker server returns response to page

Here's an image that might help. It might not.

![meh](http://i.phuu.net/TBLw/Screen%20Shot%202014-01-03%20at%2015.30.35.png)

### Starting it up

Using distra makes the following setup a lot easier:

```bash
# Run this in a seperate terminal or in the background
distra 80

distra add serviceworker-resources.dev
cd site
distra add demosite.dev
distra add demosite-origin.dev
```

1. Start the *network origin server* to serve the `site/` directory. You should be able to access it as you would any other website, ie. opening [http://demosite-origin.dev/](http://demosite-origin.dev/) should show you the "Regular old index page". (Covered by distra)
2. Edit your proxy's setup to rewrite requests to the *local origin* to go to the ServiceWorker (`localhost:5678` for example), which can then pretend it's the *local origin* and make requests to the *network origin*. In Charles, use a Rewrite (Tools > Rewrite) that modifies the Host. If you're using hoxy, there's some setup in [`hoxy-rules.txt`](hoxy-rules.txt).
3. If you're using hoxy, start it in the project's directory. It will read the `hoxy-rules.txt` file.
4. Configure your machine/browser's HTTP proxy settings to go through the proxy. By default with `hoxy`, this will be `localhost:8080`. [Screenshot](https://www.dropbox.com/s/zl8jjukj7poqlkc/Screenshot%202014-01-06%2012.01.51.png)
5. Install the dependencies with `npm install`.
6. Start the SevicerWorker server. Run `node --harmony server.js 5678 http://demosite.dev/ http://demosite-origin.dev/ worker.js`.
7. Install the unpacked Chrome extension from the `devtools/` folder of this project. You *must* have devtools open when testing this stuff; the devtools extension connects to the ServiceWorker server via WebSocket to inform it when a navigation is occuring.
8. Start the *ServiceWorker resources server* to serve the root of the project directory under the name `serviceworker-resource.dev`. (Covered by distra)

You should now be able to visit the **local** origin ([http://demosite.dev/](http://demosite.dev/)) and have it proxy through to the **network** origin, and see logging from the ServiceWorker coming from node. They'll be prefixed with `sw: `.

You can now add to the `worker.js` to play with the API. Lots of stuff is missing, but the core request interception, caching and response APIs are there.

### Worker activation flow

In case you're interested. This might not quite be accurate; it's here as a mental note.

```
new worker detected
    reload
    not different?
        return
    setup (new)
    install (new)
    save new as next

new request
    if next is waiting
        activate (current, next)
            activate (next)
            set next as current
            then
                resolve
    otherwise
        resolve
    then
        push request through worker
```

### Notes

- This stuff doesn't play nice with VPNs.
- If something's not working, try adding logging to hoxy/your proxy. You might be in a redirect loop, or not forwarding to the right place.
- No HTTPS
- Error handling is generally inconsistent and shoddy :)
- Can go to network twice – this is a misunderstanding of the spec. e.respondWith should no go to the network if the passed promise is rejected.

## Contributing

Add an issue or submit a PR or two!

If you're adding a "class" *not* from the spec, please prefix it with an underscore.
