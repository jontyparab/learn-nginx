#### Nginx commands
podman compose up -d ng0 --force-recreate
podman exec ng0 nginx -s reload

# Node and Nginx commands
#run node 
node index.js 2222 & node index.js 3333 & node index.js 4444 &
#kill all processes
kill %1 %2 %3
#run nginx with a config or update path in docker-compose
nginx -c ./nginx/nginx.tcp.conf


---
Help Notes:
A good setup will be 1 NGINX (on front) followed by 2 HA Proxy on backend
Web caching and great observability.

Not if you architect it properly—NGINX itself is extremely lightweight and event‑driven, so a single well‑tuned instance will happily handle tens of thousands of concurrent connections on modest hardware. That said, any single node can become a bottleneck if you push it past its limits, so here’s how to avoid it in a hybrid NGINX‑front, HAProxy‑back topology:

1. Horizontal Scale‑Out
– Run multiple NGINX edge proxies rather than just one. Put them behind DNS‑Round‑Robin or a small TCP load balancer (even a cloud L4 LB) on port 80/443.
– This way, no single NGINX carries 100 % of the traffic—you can grow the pool to match demand.

2. Tune Worker Processes & Connections
nginx
Copy
Edit

```conf
worker_processes auto;
events {
  worker_connections 4096;
  multi_accept on;
}
```

– `worker_processes` auto lets NGINX spin up one process per core.
– `worker_connections` controls simultaneous connections per process. On a 4‑core box, 4 × 4096 ≈ 16 K concurrent connections easily.

3. Offload Static & Caching
– Let NGINX serve static assets (JS/CSS/images) directly, so HAProxy and your backends only see dynamic/API traffic.
– Enable proxy_cache or fastcgi_cache to cut repeated hits to backends, reducing load further.

4. Health‑Check & Fail‑Over
– While OSS NGINX only has passive health checks, you can plug in a lightweight side‑car (like a small Lua script) or use third‑party modules (e.g. nginx_upstream_check_module) to more aggressively detect failures.
– If an NGINX goes down, your front‑LB (DNS or a tiny TCP proxy) can route around it.

5. SSL/TLS Offload at Scale
– Terminate TLS on NGINX with ssl_session_cache shared:SSL:10m; ssl_buffer_size 8k; and tune ssl_handshake_timeout to optimize CPU use.
– If SSL CPU is heavy, you can offload to hardware modules or use a dedicated TLS proxy in front.

6. Monitoring & Autoscaling
– Collect metrics from NGINX’s stub_status or a Prometheus exporter.
– Autoscale your NGINX fleet (in VMs, pods, or containers) when CPU or connection count passes thresholds.

TL;DR
By running multiple, tuned NGINX edge nodes (and optionally placing them behind a minimal L4 balancer) you eliminate any single‑instance bottleneck, while still benefiting from NGINX’s caching, SSL offload, and lightweight proxying—then HAProxy can focus on your dynamic traffic with its richer health checks and routing logic.