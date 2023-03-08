# website

## things need to install

- text editor
- deno (javascript runtime)
- pandoc (like document transformation tool thing. now i am installing with 'homebrew' which is like software manager thing . .)
	- technically could probably remove this but idk

## how to set up ssh keys for github authenitcation!!!!

1. run `ssh-keygen` and then press enter thru stuff u rlly dont need extra password stuff imo and idk how it rlly works

2. copy the contents of um like i think um `~/.ssh/id_rsa.pub` ? or similarly generated thing into github thing and stuff. the most important part is that it should end in `.pub`. other things may differ i think.

## things need to do?

1. generate site by running things. this can be done hopefully by running `./run.sh` in the `website/` directory

2. host local version of site in whatever way u can. here is way that i have found works on current computer: `python3 -m http.server 8000`. run this in the `out/` directory. then it will host ur website at url `localhost:8000`. then u can put that in ur web browser and it will display!!

## how to add film .

1. open `site.md`
2. add film and medium and description


### how to add stills to film page thing

1. go to `out/media/{normalized short code thing for it}`
	- the 'short code thing' is determined by lower-casing and adding hyphens in between stuff . .
	- more detailedly it is `x.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-')` which lowercases then removes everything that is not letter or whitespace then replaces whitespace with dashes.
	- basically just lowercase everything and remove special characters um or um anyways
2. copy the picture to the location and name it a number (for order)
3. regenerate website

### how to push changes of `out/` to github

here is history of commands i used

```
   98  cd out     // assuming you are already in website folder.
   99  ls         // don't need this
  100  git status // don't need this
  101  git add .
  102  git commit -m 'my change'
  103  git push origin main
```