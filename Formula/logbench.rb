class Logbench < Formula
  desc "Local log viewer and ingestion service"
  homepage "https://github.com/albingroen/logbench"
  url "https://github.com/albingroen/logbench/archive/refs/tags/v0.1.0.tar.gz"
  sha256 "PLACEHOLDER"
  license "MIT"

  depends_on "bun"

  def install
    system "bun", "install", "--frozen-lockfile"
    system "bunx", "prisma", "generate"
    system "bun", "run", "build"

    # Generate SQL schema for first-run init
    system "bunx", "prisma", "migrate", "diff",
           "--from-empty",
           "--to-schema-datamodel", "prisma/schema.prisma",
           "--script",
           "--output", "schema.sql"

    # Write version marker
    (buildpath/".logbench-version").write(version.to_s)

    # Install to libexec (internal files, not in PATH)
    libexec.install ".output", "schema.sql", ".logbench-version"

    # Install launcher and fix libexec path
    bin.install "bin/logbench"
    inreplace bin/"logbench",
              '$(cd "$(dirname "$0")/../libexec" && pwd)',
              libexec.to_s
  end

  def caveats
    <<~EOS
      Logbench runs on http://localhost:1447 by default.

      Configuration via environment variables:
        LOGBENCH_PORT=8080        # Change port
        LOGBENCH_DATA=/path/to   # Change data directory

      Data is stored in ~/.local/share/logbench/ by default.

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
