#!/usr/bin/env -S deno run --allow-run --allow-read

import { readAll } from 'https://deno.land/std@0.177.0/streams/mod.ts'
import { expandGlobSync } from "https://deno.land/std@0.170.0/fs/expand_glob.ts";

const doc = new TextDecoder().decode(await readAll(Deno.stdin))

Array.prototype.last = function() {
	return this[this.length - 1]
}

const ENC = new TextEncoder()
const DEC = new TextDecoder()
const pandoc_markdown = async md => {
	const p = Deno.run({ cmd: ['pandoc'], stdout: 'piped', stdin: 'piped' })
	await p.stdin.write(ENC.encode(md))
	await p.stdin.close()
	const out = await p.output()
	p.close();
	return DEC.decode(out)
}

/*

cat : { title, pages }
page : { title, lines }

*/

const cats = [{ type: 'home', pages: [{ lines: [] }] }]

for (const line of doc.split('\n')) {
	let match = null
	if (match = line.match(/^## (.+)/)) {
		const title = match[1].trim()
		cats.last().pages.push({ type: 'page', group: cats.last().title, title, lines: [] })
	} else if (match = line.match(/^# (.+)/)){
		const title = match[1].trim()
		cats.push({ title, pages: [] })
	} else if (match = line.match(/^!md:(.+)/)) {
		const med = match[1].trim()
		const myb = cats.last().pages.last().medium ??= med
	} else {
		const curr_page = cats.last().pages.last()
		let processed = line
		if (match = line.match(/^!yt:(.+)/)) {
			const code = match[1].trim()
			const yt_title = curr_page
				? `YouTube video player for ${curr_page.title}`
				: `Youtube video player`
			console.error(code, yt_title)
			processed = `\n<iframe class=film-yt src="https://www.youtube.com/embed/${code}" title="${yt_title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>\n`
		}
		cats.last().pages.last()?.lines.push(processed)
	}
}

const unlinePage = p => ({ ...p, lines: p.lines.join('\n')})

const home_md = cats.shift().pages[0].lines.join('\n')

const cats2 = cats.map( ({ title, pages }) =>
	({ title, type: pages.length === 1 ? 'special' : 'category', pages: pages.map(unlinePage) })
)

const title2short = x => x.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-')

const short2stills = short => [...expandGlobSync(`out/media/${short}/*.jpg`)]
	.sort((x, y) => +x.name.match(/\d+/)[0] - +y.name.match(/\d+/)[0])

const pages = await Promise.all(
	[{ group: null, title: 'index', lines: home_md}, ...cats2.map(cat => cat.pages).flat()]
	.map(async ({ group, title, lines, medium }) => {

		const short = title2short(title)
		const heading = title === 'index'
			? ''
			: medium
				? `<div class=film-intro><h2 class=title>${title}</h2><div class=film-medium>${medium}</div></div>`
				: `<div><h2>${title}</h2></div>`

		const ss = short2stills(short)

		const stills = ss.length === 0
			? ''
			: `<div class=empty></div>${ss.map((f, i) => `<img class=still src='media/${short}/${f.name}'>`).join('')}`
		return { group, title, short, content: await pandoc_markdown(heading + '\n\n' + lines) + stills }
	})
)

const out = {}

for (const { group, title, short, content } of pages) {
	if (out[short]) throw 'ununique short title: ' + short
	out[short] = {group, title, short, content} // short is redundant but whatever bestie
}

console.log(JSON.stringify(out, null, '\t'))
