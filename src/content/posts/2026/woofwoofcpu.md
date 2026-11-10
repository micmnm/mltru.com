---
title: "woofWoofCPU, bad app"
date: 2026-11-10
---

The Mac got hot, the fans took off, and I opened Activity Monitor again to play detective. Some app had been quietly chewing the CPU in the background, and it was a different one every time. After one round too many, I did the sensible thing: I made a dog do it.

Meet woofWoofCPU, a pixel-art pup that lives in your menu bar and watches per-app CPU and memory. It naps while everyone behaves. Then it sniffs, then it growls, then it barks when something stays over its limit. Click it and you can Quit the hog (hold ⌥ to Kill), Snooze it, or Ignore it and watch the dog sulk. I had way too much fun with the moods and the bark, and giving a dog a job turns out to be very satisfying. It's been on duty in my own menu bar every day since.

It's free, macOS 14+ on Apple silicon, and a side project, so expect some rough edges. Try it at [woof.mltru.com](/go/woof). Hit a bug, got an idea, or want to tell me which app your dog barks at first? [Open an issue on GitHub](https://github.com/micmnm/woofWoofCPU/issues).

A small confession about installing it: the app isn't notarized. I haven't paid Apple the $99 a year for a developer account yet, and my subscription budget already goes to Anthropic every month, for the Claude that helps me daily (this dog included). So macOS will refuse to open it the first time. If that makes you wary, fair enough: the [source is on GitHub](https://github.com/micmnm/woofWoofCPU), so you can read what the dog does or build it yourself. Otherwise, open the disk image, drag the dog to Applications, try to launch it once, then go to System Settings → Privacy & Security and click Open Anyway. One-time hassle, then the dog is on duty.
