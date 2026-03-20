class Logbench < Formula
  desc "Local log viewer and ingestion service"
  homepage "https://github.com/albingroen/logbench"
  url "https://github.com/albingroen/logbench/archive/refs/tags/v0.1.0.tar.gz"
  sha256 "f332f408f9f925765e53dbcc29cafe3ba5f59a1bcf57bdc13bb6ae7348b58f01"
  license "MIT"

  depends_on "bun"

  def install
    system "bun", "install", "--frozen-lockfile"
    system "bunx", "prisma", "generate"
    system "bun", "run", "build"

    # Generate SQL schema for first-run init
    system "bunx", "prisma", "migrate", "diff",
           "--from-empty",
           "--to-schema", "prisma/schema.prisma",
           "--script",
           "--output", "schema.sql"

    # Write version marker
    (buildpath/".logbench-version").write(version.to_s)

    # Copy native libsql binding into build output (not traced by Nitro)
    mkdir_p ".output/server/node_modules/@libsql"
    cp_r "node_modules/@libsql/darwin-arm64", ".output/server/node_modules/@libsql/"

    # Install to libexec (internal files, not in PATH)
    libexec.install ".output", "schema.sql", ".logbench-version"

    # Install launcher and fix libexec path
    bin.install "bin/logbench"
    inreplace bin/"logbench",
              '$(cd "$(dirname "$0")/../libexec" && pwd)',
              libexec.to_s
    inreplace bin/"logbench",
              "exec bun run",
              "exec #{Formula["bun"].opt_bin}/bun run"
  end

  def caveats
    <<~EOS
      Logbench runs on http://localhost:1447 by default.

      Data is stored in #{var}/logbench/.

      Start as a background service:
        brew services start logbench
    EOS
  end

  service do
    run [opt_bin/"logbench"]
    keep_alive true
    log_path var/"log/logbench.log"
    error_log_path var/"log/logbench.log"
    environment_variables PORT: "1447",
                          DATABASE_URL: "file:#{var}/logbench/logbench.db",
                          LOGBENCH_DATA: "#{var}/logbench"
  end

  test do
    port = free_port
    pid = fork do
      ENV["PORT"] = port.to_s
      ENV["DATABASE_URL"] = "file:#{testpath}/test.db"
      ENV["LOGBENCH_DATA"] = testpath.to_s
      exec bin/"logbench"
    end
    sleep 3
    assert_match "<!DOCTYPE html>", shell_output("curl -s http://127.0.0.1:#{port}/")
  ensure
    Process.kill("TERM", pid)
    Process.wait(pid)
  end
end
