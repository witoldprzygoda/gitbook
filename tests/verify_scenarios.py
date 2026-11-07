#!/usr/bin/env python3
"""
Automatyczny zestaw testów weryfikujących scenariusze dydaktyczne Git (Moduły 01-05, W01-W04)
na żywym repozytorium tymczasowym.
Uruchomienie: python tests/verify_scenarios.py
"""
import subprocess
import sys
import tempfile
import pathlib

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

def run_git(cwd: pathlib.Path, *args, check=True) -> str:
    res = subprocess.run(["git", *args], cwd=cwd, text=True, encoding="utf-8", errors="replace", capture_output=True)
    if check and res.returncode != 0:
        raise RuntimeError(f"Błąd git {' '.join(args)}:\n{res.stderr}")
    return res.stdout

def init_repo(path: pathlib.Path):
    run_git(path, "init", "-b", "main")
    run_git(path, "config", "user.name", "Kursant Testowy")
    run_git(path, "config", "user.email", "kursant@uj.edu.pl")

def test_m01_unborn_and_blobs():
    with tempfile.TemporaryDirectory() as tmp:
        repo = pathlib.Path(tmp)
        init_repo(repo)
        assert (repo / ".git" / "HEAD").read_text().strip() == "ref: refs/heads/main"
        assert not (repo / ".git" / "refs" / "heads" / "main").exists()

        # Sprawdzenie hash-object --stdin dla "A\n" (2 bajty LF) -> f70f10e4db19068f79bc43844b49f3eece45c4e8
        res_hash = subprocess.run(
            ["git", "hash-object", "--stdin"],
            input=b"A\n", cwd=repo, capture_output=True
        )
        assert res_hash.stdout.decode("utf-8").strip() == "f70f10e4db19068f79bc43844b49f3eece45c4e8"

        (repo / "a.txt").write_text("identyczna tresc\n", encoding="utf-8")
        (repo / "b.txt").write_text("identyczna tresc\n", encoding="utf-8")
        run_git(repo, "add", "a.txt", "b.txt")
        run_git(repo, "commit", "-m", "Root commit")

        assert (repo / ".git" / "refs" / "heads" / "main").exists()
        assert "parent " not in run_git(repo, "cat-file", "-p", "HEAD")
        assert run_git(repo, "cat-file", "-t", "HEAD").strip() == "commit"

        tree_lines = [line.split() for line in run_git(repo, "cat-file", "-p", "HEAD^{tree}").splitlines()]
        assert tree_lines[0][2] == tree_lines[1][2]
    print("[PASS] M01: Unborn branch, hash-object (CAS), root commit, cat-file i deduplikacja obiektów blob.")

def test_m02_three_trees_diff_restore():
    # 1. Trójkąt git diff (A/B/C), odczyt z trzech obszarów, ls-files --stage i check
    with tempfile.TemporaryDirectory() as tmp:
        repo = pathlib.Path(tmp)
        init_repo(repo)
        p = repo / "plan.txt"
        p.write_text("A\n", encoding="utf-8", newline="\n")
        run_git(repo, "add", "plan.txt")
        run_git(repo, "commit", "-m", "Zapisz A")

        p.write_text("B\n", encoding="utf-8", newline="\n")
        run_git(repo, "add", "--", "plan.txt")
        p.write_text("C\n", encoding="utf-8", newline="\n")

        # Odczyt z 3 obszarów bez zmiany stanu
        assert run_git(repo, "show", "HEAD:plan.txt") == "A\n"
        assert run_git(repo, "show", ":plan.txt") == "B\n"
        assert p.read_text(encoding="utf-8") == "C\n"
        assert run_git(repo, "status", "--porcelain") == "MM plan.txt\n"

        # Sprawdzenie obiektu blob w .git/index przez ls-files --stage
        stage_out = run_git(repo, "ls-files", "--stage", "plan.txt").strip()
        assert "223b7836fb19fdf64ba2d3cd6173c6a283141f78 0\tplan.txt" in stage_out

        # Trójkąt git diff
        diff_wt = run_git(repo, "diff")
        diff_staged = run_git(repo, "diff", "--staged")
        diff_head = run_git(repo, "diff", "HEAD")
        assert "-B\n+C" in diff_wt and "223b783..3cc58df" in diff_wt
        assert "-A\n+B" in diff_staged and "f70f10e..223b783" in diff_staged
        assert "-A\n+C" in diff_head and "f70f10e..3cc58df" in diff_head

        # Zwykły commit w stanie MM (A/B/C) zapisuje wersję B z Indeksu, zostawiając C na dysku
        run_git(repo, "commit", "-m", "Zapisz B")
        assert run_git(repo, "show", "HEAD:plan.txt") == "B\n"
        assert run_git(repo, "show", ":plan.txt") == "B\n"
        assert p.read_text(encoding="utf-8") == "C\n"
        assert run_git(repo, "status", "--porcelain") == " M plan.txt\n"

        # Kontrola białych znaków przed commitem (git diff --staged --check)
        p.write_text("D \n", encoding="utf-8", newline="\n")
        run_git(repo, "add", "--", "plan.txt")
        res_check = subprocess.run(
            ["git", "diff", "--staged", "--check"],
            cwd=repo, text=True, encoding="utf-8", capture_output=True
        )
        assert res_check.returncode == 2
        assert "trailing whitespace" in res_check.stdout

    # 2. Cztery warianty git restore w stanie A / B / C oraz pułapka commit -a i git mv
    for mode in ("staged", "work", "source", "both", "commit_a", "mv"):
        with tempfile.TemporaryDirectory() as tmp:
            repo = pathlib.Path(tmp)
            init_repo(repo)
            p = repo / "plan.txt"
            p.write_text("A\n", encoding="utf-8", newline="\n")
            run_git(repo, "add", "plan.txt")
            run_git(repo, "commit", "-m", "Zapisz A")
            p.write_text("B\n", encoding="utf-8", newline="\n")
            run_git(repo, "add", "--", "plan.txt")
            p.write_text("C\n", encoding="utf-8", newline="\n")

            if mode == "staged":
                run_git(repo, "restore", "--staged", "--", "plan.txt")
                assert (run_git(repo, "show", "HEAD:plan.txt").strip(),
                        run_git(repo, "show", ":plan.txt").strip(),
                        p.read_text(encoding="utf-8").strip()) == ("A", "A", "C")
                assert run_git(repo, "status", "--porcelain") == " M plan.txt\n"
            elif mode == "work":
                run_git(repo, "restore", "--", "plan.txt")
                assert (run_git(repo, "show", "HEAD:plan.txt").strip(),
                        run_git(repo, "show", ":plan.txt").strip(),
                        p.read_text(encoding="utf-8").strip()) == ("A", "B", "B")
                assert run_git(repo, "status", "--porcelain") == "M  plan.txt\n"
            elif mode == "source":
                run_git(repo, "restore", "--source=HEAD", "--", "plan.txt")
                assert (run_git(repo, "show", "HEAD:plan.txt").strip(),
                        run_git(repo, "show", ":plan.txt").strip(),
                        p.read_text(encoding="utf-8").strip()) == ("A", "B", "A")
                assert run_git(repo, "status", "--porcelain") == "MM plan.txt\n"
            elif mode == "both":
                run_git(repo, "restore", "--staged", "--worktree", "--", "plan.txt")
                assert (run_git(repo, "show", "HEAD:plan.txt").strip(),
                        run_git(repo, "show", ":plan.txt").strip(),
                        p.read_text(encoding="utf-8").strip()) == ("A", "A", "A")
                assert run_git(repo, "status", "--porcelain") == ""
            elif mode == "commit_a":
                (repo / "notatki.txt").write_text("Nowy\n", encoding="utf-8", newline="\n")
                run_git(repo, "commit", "-a", "-m", "Zapisz z flaga -a")
                assert run_git(repo, "show", "HEAD:plan.txt") == "C\n"
                assert run_git(repo, "status", "--porcelain") == "?? notatki.txt\n"
            elif mode == "mv":
                run_git(repo, "add", "--", "plan.txt")
                run_git(repo, "commit", "-m", "Zapisz C")
                before_blob = run_git(repo, "ls-files", "-s", "plan.txt").split()[1]
                run_git(repo, "mv", "plan.txt", "plan-archiwum.txt")
                after_blob = run_git(repo, "ls-files", "-s", "plan-archiwum.txt").split()[1]
                assert before_blob == after_blob == "3cc58df83752123644fef39faab2393af643b1d2"
                assert run_git(repo, "status", "--porcelain") == "R  plan.txt -> plan-archiwum.txt\n"

    # 3. Zakresy git add w podkatalogu (. vs -A vs -u)
    for scope in ("dot", "all", "update"):
        with tempfile.TemporaryDirectory() as tmp:
            repo = pathlib.Path(tmp)
            init_repo(repo)
            sub = repo / "podkatalog"
            sub.mkdir()
            (repo / "README.md").write_text("A\n", encoding="utf-8", newline="\n")
            (sub / "plan.txt").write_text("A\n", encoding="utf-8", newline="\n")
            (sub / "stary.txt").write_text("A\n", encoding="utf-8", newline="\n")
            run_git(repo, "add", ".")
            run_git(repo, "commit", "-m", "Stan poczatkowy")

            (repo / "README.md").write_text("B\n", encoding="utf-8", newline="\n")
            (repo / "nowy.txt").write_text("Nowy\n", encoding="utf-8", newline="\n")
            (sub / "plan.txt").write_text("B\n", encoding="utf-8", newline="\n")
            (sub / "stary.txt").unlink()
            (sub / "notatki.txt").write_text("Notatki\n", encoding="utf-8", newline="\n")

            if scope == "dot":
                run_git(sub, "add", ".")
                st = run_git(repo, "status", "--porcelain")
                assert " M README.md\n" in st and "?? nowy.txt\n" in st
                assert "A  podkatalog/notatki.txt\n" in st and "M  podkatalog/plan.txt\n" in st and "D  podkatalog/stary.txt\n" in st
            elif scope == "all":
                run_git(sub, "add", "-A")
                st = run_git(repo, "status", "--porcelain")
                assert "M  README.md\n" in st and "A  nowy.txt\n" in st and "A  podkatalog/notatki.txt\n" in st
            elif scope == "update":
                run_git(sub, "add", "-u")
                st = run_git(repo, "status", "--porcelain")
                assert "M  README.md\n" in st and "M  podkatalog/plan.txt\n" in st and "D  podkatalog/stary.txt\n" in st
                assert "?? nowy.txt\n" in st and "?? podkatalog/notatki.txt\n" in st

    # 4. .gitignore, check-ignore -v, wzorce z wyjątkiem (!), git rm --cached i historia
    with tempfile.TemporaryDirectory() as tmp:
        repo = pathlib.Path(tmp)
        init_repo(repo)
        (repo / "README.md").write_text("# Projekt\n", encoding="utf-8", newline="\n")
        (repo / "debug.log").write_text("Stary log\n", encoding="utf-8", newline="\n")
        run_git(repo, "add", "README.md", "debug.log")
        run_git(repo, "commit", "-m", "Zapisz log")

        (repo / ".gitignore").write_text(
            "tmp/*\n!tmp/keep.txt\nbuild/\n.env\ndebug.log\n",
            encoding="utf-8", newline="\n"
        )
        (repo / "build").mkdir()
        (repo / "tmp").mkdir()
        (repo / ".env").write_text("DEMO_TOKEN\n", encoding="utf-8", newline="\n")
        (repo / "build" / "wynik.txt").write_text("Wynik\n", encoding="utf-8", newline="\n")
        (repo / "tmp" / "a.txt").write_text("x\n", encoding="utf-8", newline="\n")
        (repo / "tmp" / "keep.txt").write_text("zachowaj\n", encoding="utf-8", newline="\n")
        (repo / "debug.log").write_text("Nowy log\n", encoding="utf-8", newline="\n")

        st = run_git(repo, "status", "--porcelain", "--untracked-files=all")
        assert " M debug.log\n" in st
        assert "?? tmp/keep.txt\n" in st
        assert ".env" not in st and "tmp/a.txt" not in st

        res_ci = subprocess.run(
            ["git", "check-ignore", "-v", "debug.log"],
            cwd=repo, text=True, encoding="utf-8", capture_output=True
        )
        assert res_ci.returncode == 1
        assert ".gitignore:5:debug.log" in run_git(repo, "check-ignore", "-v", "--no-index", "debug.log")

        run_git(repo, "rm", "--cached", "debug.log")
        assert (repo / "debug.log").exists()
        run_git(repo, "add", ".gitignore", "tmp/keep.txt")
        run_git(repo, "commit", "-m", "Pomijaj debug.log")
        assert run_git(repo, "status", "--porcelain") == ""
        assert run_git(repo, "show", "HEAD~1:debug.log") == "Stary log\n"

    print("[PASS] M02: Trzy obszary (A/B/C), trójkąt diff, zakresy add/mv, 4 warianty restore i .gitignore.")

def test_m03_dag_reset_revert_stash_reflog():
    with tempfile.TemporaryDirectory() as tmp:
        repo = pathlib.Path(tmp)
        init_repo(repo)
        p = repo / "dane.txt"
        p.write_text("C1\n", encoding="utf-8", newline="\n")
        run_git(repo, "add", "dane.txt")
        run_git(repo, "commit", "-m", "C1")

        p.write_text("C2\n", encoding="utf-8", newline="\n")
        run_git(repo, "add", "dane.txt")
        run_git(repo, "commit", "-m", "C2")

        # 1. git revert tworzy nowy commit odwrotny (3 commity w historii)
        run_git(repo, "revert", "--no-edit", "HEAD")
        assert p.read_text(encoding="utf-8") == "C1\n"
        assert len(run_git(repo, "log", "--oneline").splitlines()) == 3

        # 2. git reset (--soft, --mixed, --hard) i odzyskiwanie z reflog
        run_git(repo, "reset", "--hard", "HEAD~1")
        assert p.read_text(encoding="utf-8") == "C2\n"

        run_git(repo, "reset", "--soft", "HEAD~1")
        assert run_git(repo, "status", "--porcelain") == "M  dane.txt\n"

        run_git(repo, "reset", "--hard", "HEAD@{1}")
        run_git(repo, "reset", "--mixed", "HEAD~1")
        assert run_git(repo, "status", "--porcelain") == " M dane.txt\n"

        # 3. git stash (-u) jako wielorodzicowy obiekt commit pod refs/stash
        (repo / "untracked.txt").write_text("tmp\n", encoding="utf-8", newline="\n")
        run_git(repo, "stash", "push", "-u", "-m", "WIP: test")
        assert run_git(repo, "status", "--porcelain") == ""
        stash_parents = run_git(repo, "rev-list", "--parents", "-n", "1", "refs/stash").strip().split()
        assert len(stash_parents) == 4  # stash commit + 3 rodziców (HEAD, Index, Untracked)
        run_git(repo, "stash", "pop")
        assert (repo / "untracked.txt").exists()

    print("[PASS] M03: Graf DAG, revert, reset (--soft/--mixed/--hard), reflog i wielorodzicowy stash.")

def test_m04_branches_merge_rebase_conflicts():
    with tempfile.TemporaryDirectory() as tmp:
        repo = pathlib.Path(tmp)
        init_repo(repo)
        (repo / "app.py").write_text("PORT = 8000\n", encoding="utf-8", newline="\n")
        run_git(repo, "add", "app.py")
        run_git(repo, "commit", "-m", "Base commit")
        base_oid = run_git(repo, "rev-parse", "HEAD").strip()

        # 1. Fast-Forward
        run_git(repo, "switch", "-c", "feature-ff")
        (repo / "ff.txt").write_text("ff\n", encoding="utf-8", newline="\n")
        run_git(repo, "add", "ff.txt")
        run_git(repo, "commit", "-m", "FF commit")
        run_git(repo, "switch", "main")
        assert "Fast-forward" in run_git(repo, "merge", "feature-ff")
        assert len(run_git(repo, "rev-list", "--parents", "-n", "1", "HEAD").strip().split()) == 2

        # 2. Konflikt 3-Way Merge i sloty :1:, :2:, :3: w .git/index
        run_git(repo, "switch", "-c", "feature-conflict")
        (repo / "app.py").write_text("PORT = 9090\n", encoding="utf-8", newline="\n")
        run_git(repo, "add", "app.py")
        run_git(repo, "commit", "-m", "Zmiana portu na 9090 (feature)")

        run_git(repo, "switch", "main")
        (repo / "app.py").write_text("PORT = 8080\n", encoding="utf-8", newline="\n")
        run_git(repo, "add", "app.py")
        run_git(repo, "commit", "-m", "Zmiana portu na 8080 (main)")

        # Wspólny przodek (LCA)
        lca = run_git(repo, "merge-base", "main", "feature-conflict").strip()
        assert lca != ""

        res_merge = subprocess.run(
            ["git", "merge", "feature-conflict"],
            cwd=repo, text=True, encoding="utf-8", capture_output=True
        )
        assert res_merge.returncode != 0
        unmerged = run_git(repo, "ls-files", "-u")
        assert " 1\tapp.py" in unmerged and " 2\tapp.py" in unmerged and " 3\tapp.py" in unmerged
        assert run_git(repo, "show", ":1:app.py") == "PORT = 8000\n"
        assert run_git(repo, "show", ":2:app.py") == "PORT = 8080\n"
        assert run_git(repo, "show", ":3:app.py") == "PORT = 9090\n"

        # Rozwiązanie konfliktu
        (repo / "app.py").write_text("PORT = 8080\nFALLBACK_PORT = 9090\n", encoding="utf-8", newline="\n")
        run_git(repo, "add", "app.py")
        run_git(repo, "commit", "-m", "Rozwiazanie konfliktu portow")
        assert len(run_git(repo, "rev-list", "--parents", "-n", "1", "HEAD").strip().split()) == 3

        # 3. HEAD~1 vs HEAD^2 na Merge Commicie
        p1 = run_git(repo, "rev-parse", "HEAD~1").strip()
        p2 = run_git(repo, "rev-parse", "HEAD^2").strip()
        assert p1 != p2

    print("[PASS] M04: Fast-Forward, 3-Way Merge, LCA (merge-base), sloty konfliktu :1/:2/:3 i HEAD~1 vs HEAD^2.")

def test_m05_remotes_fetch_pull_push_lease():
    with tempfile.TemporaryDirectory() as tmp:
        root = pathlib.Path(tmp)
        remote_bare = root / "origin.git"
        dev_a = root / "dev_a"
        dev_b = root / "dev_b"

        remote_bare.mkdir()
        run_git(remote_bare, "init", "--bare", "-b", "main")

        dev_a.mkdir()
        init_repo(dev_a)
        (dev_a / "README.md").write_text("v1\n", encoding="utf-8", newline="\n")
        run_git(dev_a, "add", "README.md")
        run_git(dev_a, "commit", "-m", "C1: v1")
        run_git(dev_a, "remote", "add", "origin", str(remote_bare))
        run_git(dev_a, "push", "-u", "origin", "main")

        # Sprawdzenie refspec w .git/config
        cfg_out = run_git(dev_a, "config", "--get", "remote.origin.fetch").strip()
        assert cfg_out == "+refs/heads/*:refs/remotes/origin/*"

        # Dev B klonuje i wypycha nowy commit C2
        run_git(root, "clone", str(remote_bare), str(dev_b))
        run_git(dev_b, "config", "user.name", "Dev B")
        run_git(dev_b, "config", "user.email", "devb@uj.edu.pl")
        (dev_b / "README.md").write_text("v2 from Dev B\n", encoding="utf-8", newline="\n")
        run_git(dev_b, "commit", "-am", "C2: v2")
        run_git(dev_b, "push", "origin", "main")

        # Dev A robi git fetch: origin/main się przesuwa, ale katalog roboczy Dev A ma nadal "v1\n"
        run_git(dev_a, "fetch", "origin")
        assert (dev_a / "README.md").read_text(encoding="utf-8") == "v1\n"
        assert run_git(dev_a, "show", "origin/main:README.md") == "v2 from Dev B\n"

        # Dev A scala przez pull --rebase
        run_git(dev_a, "pull", "--rebase", "origin", "main")
        assert (dev_a / "README.md").read_text(encoding="utf-8") == "v2 from Dev B\n"

    print("[PASS] M05: Bare remote, refspec, git fetch (bez zmiany worktree), git pull --rebase i git push -u.")

if __name__ == "__main__":
    test_m01_unborn_and_blobs()
    test_m02_three_trees_diff_restore()
    test_m03_dag_reset_revert_stash_reflog()
    test_m04_branches_merge_rebase_conflicts()
    test_m05_remotes_fetch_pull_push_lease()
    print("\nWszystkie scenariusze Modułów 01–05 zweryfikowane pomyślnie na żywym Gicie!")
