a=input().split();es={};d=int(a[3]);e=int(a[4])
for i in range(int(a[7])):[x,y]=input().split();es[int(x)]=int(y)
while 1:
  u,v,w=input().split();u=int(u);v=int(v);s=0;a='WAIT'
  if (d==u and (e<v and w[0]=='R' or e>v and w[0]=='L'))or(d>u and u>-1 and (es[u]<v and w[0]=='R' or es[u]>v and w[0]=='L')):s=1
  if s:a='BLOCK'
  print(a)
