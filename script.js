const json = fetch('./site.json').then(r => r.json())

const CONTENT = document.querySelector('#content')
const DETAILS = [...document.querySelectorAll('details')]
const NAVAS = [...document.querySelectorAll('nav a')]

// enforce one category open at a time
DETAILS.forEach((d, i) => {
	d.addEventListener('click', e => {
		if (e.target.tagName !== 'SUMMARY') return
		const should_be_open_now = !e.target.parentElement.open

		if (!should_be_open_now)
			DETAILS.forEach(x => x.open = false)
		else
			DETAILS.forEach((x, j) => x.open = i === j)

		e.preventDefault()
	})
})

// dynamically display page content from short code
const display = short =>
	json.then(j => {
		CONTENT.innerHTML = j[short].content
		document.querySelectorAll('.current-page').forEach(e => e.classList.remove('current-page'))
		NAVAS.find(a => a.getAttribute('short') === short).classList.add('current-page') // css selector ok?
		console.log(j[short].group)
		DETAILS.forEach(d => d.open = d.getAttribute('group') === j[short].group)
	})

// override nav links with dynamic page load
for (const a of NAVAS) {
	a.onclick = e => {
		const short = a.getAttribute('short')
		display(short).then(_ => history.pushState({ short }, '', a.href))
		e.preventDefault()
	}
}

// handle browser back button
window.addEventListener('popstate', e => display(e.state?.short ?? short_base))
