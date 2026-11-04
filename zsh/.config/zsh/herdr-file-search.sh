#!/usr/bin/env bash

# Herdr file search popup: fuzzy-find files and folders across the home folder.
#   enter   open in $EDITOR (nvim) inside the popup
#   ctrl-y  insert the path(s) into the focused pane (e.g. an agent prompt)
#   ctrl-g  toggle file-name search <-> content (ripgrep) search
# Includes hidden and ignored paths; macOS-protected paths are skipped.

set -euo pipefail

script_path="${BASH_SOURCE[0]}"
rg_globs=(--hidden --glob '!.git/' --glob '!build/' --glob '!.dart_tool/')

case "${1:-}" in
    --files)
        find "$PWD" -mindepth 1 \( -type f -o -type d \) -print 2>/dev/null || true
        exit 0
        ;;
    --grep)
        [[ -z "${2:-}" ]] && exit 0
        rg --line-number --no-heading --color=always --smart-case "${rg_globs[@]}" -- "$2" 2>/dev/null || true
        exit 0
        ;;
    --preview)
        # Arg is either `path` or `path:line:text` (grep mode).
        target="$2"
        if [[ -d "$target" ]]; then
            ls -la "$target"
        elif [[ "$target" =~ ^([^:]+):([0-9]+): ]]; then
            line="${BASH_REMATCH[2]}"
            start=$(( line > 20 ? line - 20 : 1 ))
            sed -n "${start},$(( start + 200 ))p" "${BASH_REMATCH[1]}"
        else
            sed -n '1,200p' "$target"
        fi
        exit 0
        ;;
esac

root="$HOME"
cd "$root"

editor="${EDITOR:-nvim}"
self="bash '$script_path'"

out="$(
    "$script_path" --files | fzf \
        --multi \
        --ansi \
        --prompt 'files> ' \
        --header "$root  enter: edit/open folder  ctrl-y: send path  ctrl-g: grep/files" \
        --preview "$self --preview {}" \
        --preview-window 'right,55%' \
        --expect 'ctrl-y' \
        --bind 'start:unbind(change)' \
        --bind "change:reload:$self --grep {q}" \
        --bind "ctrl-g:transform:if [ \"\$FZF_PROMPT\" = 'files> ' ]; then echo 'change-prompt(grep> )+disable-search+rebind(change)+reload($self --grep {q})'; else echo 'change-prompt(files> )+enable-search+unbind(change)+reload($self --files)'; fi"
)" || exit 0

key="$(head -n1 <<<"$out")"
picks=()
while IFS= read -r line; do
    [[ -n "$line" ]] && picks+=("$line")
done < <(tail -n +2 <<<"$out")
[[ ${#picks[@]} -eq 0 ]] && exit 0

# Grep results look like `path:line:text`; keep path (and line for the editor).
paths=()
first_line=""
for pick in "${picks[@]}"; do
    pick="$(sed $'s/\x1b\\[[0-9;]*m//g' <<<"$pick")"
    if [[ "$pick" =~ ^([^:]+):([0-9]+): ]]; then
        paths+=("${BASH_REMATCH[1]}")
        [[ -z "$first_line" ]] && first_line="${BASH_REMATCH[2]}"
    else
        paths+=("$pick")
    fi
done

if [[ "$key" == "ctrl-y" ]]; then
    pane="${HERDR_ACTIVE_PANE_ID:-}"
    [[ -z "$pane" ]] && exit 0
    "${HERDR_BIN_PATH:-herdr}" pane send-text "$pane" "${paths[*]} " >/dev/null
    exit 0
fi

if [[ ${#paths[@]} -eq 1 && -d "${paths[0]}" ]]; then
    exec "${HERDR_BIN_PATH:-herdr}" workspace create --cwd "${paths[0]}" --focus
fi

if [[ -n "$first_line" && ${#paths[@]} -eq 1 ]]; then
    exec "$editor" "+$first_line" "${paths[0]}"
fi
exec "$editor" "${paths[@]}"
