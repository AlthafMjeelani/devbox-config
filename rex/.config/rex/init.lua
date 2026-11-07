-- Rex terminal config (Superlogical Rex). Lives at ~/.config/rex/init.lua.
--
-- tmux-style prefix: press ctrl+q, release, then the key. Keys are joined with ">".
-- After editing:   rex config check      validate this file
--                  rex config reload     apply it (run on the machine that hosts the server)
--                  rex keymap            list every loaded binding and its source line
-- Rex needs no config at all, so deleting this file is always safe.

-- Send a literal ctrl+q to the program (so tmux/Claude Code still get theirs): press it twice.
rex.bind("ctrl+q>ctrl+q", "pane.send_key", { key = "ctrl+q" })

-- Tabs (Rex "windows")
rex.bind("ctrl+q>c", "client.tab.new")
rex.bind("ctrl+q>n", "client.tab.next")
rex.bind("ctrl+q>p", "client.tab.previous")
rex.bind("ctrl+q>,", "client.tab.rename")
rex.bind("ctrl+q>w", "client.tab.close")

-- Sessions (one session per project or per agent task)
rex.bind("ctrl+q>s", "session.switch")
rex.bind("ctrl+q>r", "session.rename")
rex.bind("ctrl+q>[", "session.previous")
rex.bind("ctrl+q>]", "session.next")

-- Panes (Rex "blocks")
rex.bind("ctrl+q>v", "pane.split", { direction = "right" })
rex.bind("ctrl+q>-", "pane.split", { direction = "down" })
rex.bind("ctrl+q>z", "pane.zoom")
rex.bind("ctrl+q>x", "pane.close")
rex.bind("ctrl+q>=", "pane.balance")
