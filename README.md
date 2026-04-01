<img width="3828" height="2490" alt="CleanShot 2026-03-12 at 15 26 36" src="https://github.com/user-attachments/assets/a6910045-9c57-4ccf-8285-fe048579e875" />

# Logbench

What is this, you might ask? Well, it's an attempt to build a better console.log experience.

This repo is the ingestion server and graphical user interface. If you're looking for how to set up Logbench in your codebase, have a look at one of the bindings:

- [JavaScript/TypeScript SDK](https://github.com/albingroen/logbench-js)
- [Python SDK (Beta)](https://github.com/albingroen/logbench-python)
- [Golang SDK (Beta)](https://github.com/albingroen/logbench-go)

## Getting started

Logbench is not a desktop application or a hosted system. It's a web application that runs completely locally on your machine.

#### Requirements

- [Bun](https://bun.sh/)

### 1. Homebrew

If you're on a M1 or later Mac, you can install Logbench through Homebrew.

```bash
# Install
brew tap albingroen/logbench
brew install logbench

# Start in the background
brew services start logbench
```

### 2. Build from source

If you're on a x86_64 Mac, or a Linux or Windows system, the easiest is to build Logbench from source.

```bash
# Clone repository
git clone https://github.com/albingroen/logbench.git $HOME/logbench

# Change directory
cd $HOME/logbench

# Install dependencies
bun install --frozen-lockfile

# Run
bun run start
```

## Accessing the GUI

Logbench runs on port 1447 by default. You can of course configure this, but the easiest is just to keep this as preconfigured.

http://localhost:1447
