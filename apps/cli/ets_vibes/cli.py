import typer
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn
from pathlib import Path
from typing import Optional
import re
import datetime

from .profile import ProfileDetector
from .editor import SaveEditor
from .compression import decompress_save
from .games import get_current_platform, detect_installed_games

app = typer.Typer(
    name="ets-vibes",
    help="Save Editor for Euro Truck Simulator 2 and American Truck Simulator",
    add_completion=False,
    rich_markup_mode="rich",
)

console = Console()

def get_profile_display_name(hex_name: str) -> str:
    try:
        return bytes.fromhex(hex_name).decode("utf-8")
    except:
        return hex_name

def format_money(value: int) -> str:
    return f"€{value:,}".replace(",", ".")

@app.command("list")
def list_saves():
    """List all found profiles and saves."""
    console.print()
    console.print(Panel.fit("ETS-Vibes - Save Editor", border_style="blue"))
    console.print()
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        transient=True,
    ) as progress:
        progress.add_task("Searching profiles...", total=None)
        detector = ProfileDetector()
        profiles = detector.get_profiles()
    
    if not profiles:
        console.print("[yellow]No profiles found.[/yellow]")
        return
    
    for profile in profiles:
        name = get_profile_display_name(profile.name)
        saves = detector.get_saves(profile)
        
        if not saves:
            continue
        
        table = Table(
            title=f"Profile: [bold]{name}[/bold]",
            show_header=True,
            header_style="bold cyan",
        )
        table.add_column("Save")
        table.add_column("Money", justify="right", style="green")
        table.add_column("XP", justify="right", style="yellow")
        table.add_column("Modified", style="dim")
        
        for save in saves:
            try:
                editor = SaveEditor(save)
                editor.load()
                
                money = editor.document.get_property("money_account") or "?"
                xp = editor.document.get_property("experience_points") or "?"
                
                if money.isdigit():
                    money = format_money(int(money))
                if xp.isdigit():
                    xp = f"{int(xp):,}".replace(",", ".")
                
                mtime = save.game_sii_path.stat().st_mtime
                dt = datetime.datetime.fromtimestamp(mtime)
                modified = dt.strftime("%d/%m %H:%M")
                
                table.add_row(save.name, money, xp, modified)
            except:
                table.add_row(save.name, "[red]error[/red]", "-", "-")
        
        console.print(table)
        console.print()

@app.command("edit")
def edit_save(
    save_name: str = typer.Argument(..., help="Save name to edit"),
    money: Optional[int] = typer.Option(None, "--money", "-m", help="New money value"),
    xp: Optional[int] = typer.Option(None, "--xp", "-x", help="New XP value"),
    profile: Optional[str] = typer.Option(None, "--profile", "-p", help="Profile name"),
):
    """Edit a specific save."""
    if money is None and xp is None:
        console.print("[red]Specify --money or --xp[/red]")
        raise typer.Exit(1)
    
    detector = ProfileDetector()
    target_save = None
    target_profile = None
    
    for p in detector.get_profiles():
        name = get_profile_display_name(p.name)
        if profile and profile.lower() not in name.lower():
            continue
        
        for s in detector.get_saves(p):
            if s.name == save_name:
                target_save = s
                target_profile = p
                break
        if target_save:
            break
    
    if not target_save:
        console.print(f"[red]Save '{save_name}' not found.[/red]")
        raise typer.Exit(1)
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        transient=True,
    ) as progress:
        progress.add_task("Loading save...", total=None)
        editor = SaveEditor(target_save)
        editor.load()
        
        changes = []
        if money is not None:
            old_money = editor.document.get_property("money_account") or "0"
            editor.document.set_property("money_account", str(money))
            changes.append(("Money", format_money(int(old_money)), format_money(money)))
        
        if xp is not None:
            old_xp = editor.document.get_property("experience_points") or "0"
            editor.document.set_property("experience_points", str(xp))
            changes.append(("XP", f"{int(old_xp):,}", f"{xp:,}"))
        
        editor.save()
        
        info_path = target_save.path / "info.sii"
        if info_path.exists():
            try:
                raw = info_path.read_bytes()
                content = decompress_save(raw)
                if money is not None:
                    content = re.sub(r'info_money_account:\s*\d+', f'info_money_account: {money}', content)
                info_path.write_text(content, encoding='utf-8')
            except:
                pass
    
    console.print("[green]Save updated successfully.[/green]")
    for field, old, new in changes:
        console.print(f"   {field}: [dim]{old}[/dim] -> [bold green]{new}[/bold green]")

@app.command("quick")
def quick_money(money: int = typer.Argument(50_000_000)):
    """Set money for all saves."""
    detector = ProfileDetector()
    edited = 0
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console,
    ) as progress:
        task = progress.add_task("Processing...", total=None)
        for profile in detector.get_profiles():
            for save in detector.get_saves(profile):
                try:
                    editor = SaveEditor(save)
                    editor.load()
                    editor.document.set_property("money_account", str(money))
                    editor.save()
                    
                    info_path = save.path / "info.sii"
                    if info_path.exists():
                        try:
                            content = decompress_save(info_path.read_bytes())
                            content = re.sub(r'info_money_account:\s*\d+', f'info_money_account: {money}', content)
                            info_path.write_text(content, encoding='utf-8')
                        except:
                            pass
                    edited += 1
                except:
                    pass
    console.print(f"[green]{edited} saves updated.[/green]")

@app.command("quick-xp")
def quick_xp(xp: int = typer.Argument(10_000_000)):
    """Set XP for all saves."""
    detector = ProfileDetector()
    edited = 0
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console,
    ) as progress:
        task = progress.add_task("Processing...", total=None)
        for profile in detector.get_profiles():
            for save in detector.get_saves(profile):
                try:
                    editor = SaveEditor(save)
                    editor.load()
                    editor.document.set_property("experience_points", str(xp))
                    editor.save()
                    edited += 1
                except:
                    pass
    console.print(f"[green]{edited} saves updated with {xp:,} XP.[/green]".replace(",", "."))

@app.command("version")
def show_version():
    """Show version info."""
    console.print("ETS-Vibes v1.0.0")
    console.print(f"Platform: {get_current_platform().value}")
    games = detect_installed_games()
    if games:
        console.print(f"Detected games: {', '.join(g.name for g in games)}")

def main():
    app()

if __name__ == "__main__":
    main()
