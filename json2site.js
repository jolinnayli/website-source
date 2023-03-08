#!/usr/bin/env -S deno run --allow-write

import { readAll } from 'https://deno.land/std@0.177.0/streams/mod.ts'

const title2short = x => x.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-')

Array.prototype.to_h = function() {
	return Object.fromEntries(this)
}

Object.prototype.to_a = function() {
	return Object.entries(this)
}

Object.prototype.vals = function() {
	return Object.values(this)
}

const unslurp = (path, str) => Deno.writeFile(path, new TextEncoder().encode(str))

const json = JSON.parse(new TextDecoder().decode(await readAll(Deno.stdin)))

const counts = xs => {
	const res = {}
	for (const x of xs)
		res[x] = (res[x] ?? 0) + 1
	return res
}

// note: *should* keep order?
const groups = counts(json.vals().map(x => x.group).filter(x => x))
	.to_a()
	.filter(x => x[1] > 1)
	.map(x => x[0])

const navs = [...new Set(json.vals().map(x => x.group).filter(x => x))]

const tag = x => y => `<${x}>${y}</${x}>`

// normal form for links
const short2path = short => short === 'index'
	? 'index.html'
	: `${short}.html`

const navstuff = curr => navs.map(g => {

	// special 'About' case -- whole page, not a group
	if (!groups.includes(g)) {
		const page = json.vals().find(({ group }) => g === group)
		return `<a short='${page.short}' href='${short2path(page.short)}'${page.short === curr.short ? ' class=current-page' : ''}>${g}</a>` // alert: bad hack
	}

	return `<details group='${g}' class=nav-category${g === curr.group ? ' open' : ''}>
		<summary>${g}</summary>
		${json.vals().filter(({group}) => g === group)
			.map(({ title, short }) => `<a short='${short}' class='${curr.short === short ? 'current-page ' : ''}title' href='${short2path(short)}'><img class=thumb src='media/${short}/01.jpg'>${title}</a>`)
			.join('')}
	</details>`
}).join('')

// page => html
const generate_page = page => `<!DOCTYPE html>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta charset="UTF-8">

<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">

<link rel=stylesheet href=style.css>

<body>
	<div id=header>
		<nav>
			<h1><a short=index id=name href=${short2path('index')}>Jolinna</a></h1>
			${navstuff(page)}
		</nav>
	</div>
	<div id=content>
		${page.content}
	</div>
</body>
<script>const short_base = '${page.short}'</script>
<script src=script.js></script>
`

console.log(await Promise.all(json.to_a().map(async ([short, page]) => [short, await unslurp(`out/${short}.html`, generate_page(page))])))

await unslurp('out/site.json', JSON.stringify(json))//JSON.stringify(json.to_a().map(([x, y]) => [short2path(x), y]).to_h()))

console.log('OK')