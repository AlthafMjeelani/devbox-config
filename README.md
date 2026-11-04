# devbox-config

Personal dotfiles and AI-agent tooling config, managed with GNU Stow.

## Install

```sh
git clone https://github.com/AlthafMjeelani/devbox-config ~/devbox-config
cd ~/devbox-config
make list
make agents-sync && make stow
```

Back up any existing `~/.zshrc`, `~/.gitconfig` and similar files first, because Stow refuses to overwrite them.

## Update

Files in `$HOME` are symlinks into this repo, so editing a config edits the repo file.
Then commit and push from `~/devbox-config`.

## Credits

Started from a colleague's dotfiles layout and adapted.

## Shell

`zsh`, `zshenv` and `zprofile` are not in the default package list, because they move `ZDOTDIR` and replace `~/.zshrc`.
Stow them explicitly with `make stow PKG="zsh zshenv zprofile"` when you want them.
