# Convergent Evolution: How Different Language Models Learn Similar Number Representations

Project page and companion blog post for the paper *Convergent Evolution: How Different Language Models Learn Similar Number Representations* by Deqing Fu, Tianyi Zhou, Mikhail Belkin, Vatsal Sharan, and Robin Jia (USC, UC San Diego).

- **Project page:** [convergent-evolution.github.io](https://convergent-evolution.github.io/) ([index.html](index.html))
- **Blog post:** [convergent-evolution.github.io/blog.html](https://convergent-evolution.github.io/blog.html) ([blog.html](blog.html))
- **Paper:** `arXiv:XXXX.XXXXX` (placeholder — update once posted)
- **Models:** [Hugging Face collection](https://hf.co/collections/deqing/convergent-evolution)

## Summary

Language models develop Fourier spikes at periods $T = 2, 5, 10$ when representing numbers. This property is **universal**: every pretrained LLM examined, classical word embeddings, and even the raw number-token frequency distribution with no model at all show the same spikes. But linear separability of numbers by their residue mod $T$ is **selective** — only some systems achieve it.

The paper proves these two properties can dissociate arbitrarily (Theorem 1: Fourier sparsity is necessary but not sufficient for mod-$T$ linear separability), identifies what causes the gap in controlled 300M-parameter pretraining runs on 10B FineWeb-Edu tokens, and shows that multi-token addition training reaches the same endpoint through a different mechanism.

## Repository layout

```
index.html       Project landing page
blog.html        Long-form blog walkthrough (Anthropic-style)
style.css        Shared stylesheet
favicon.svg      Cladogram + Fourier-wave favicon
images/          Figures from the paper (PNG, 300 DPI)
images/logo/     USC and UCSD seals used on the landing page
latex/           LaTeX source for the paper
```

## Local preview

```
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000). The `.html` files also load directly over `file://`, but relative paths and anchor links work more reliably over HTTP.

## Citation

```bibtex
@article{fu2026convergent,
  title   = {Convergent Evolution: How Different Language Models Learn Similar Number Representations},
  author  = {Fu, Deqing and Zhou, Tianyi and Belkin, Mikhail and Sharan, Vatsal and Jia, Robin},
  journal = {arXiv preprint arXiv:XXXX.XXXXX},
  year    = {2026}
}
```
