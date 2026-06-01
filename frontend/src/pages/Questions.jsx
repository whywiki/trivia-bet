import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { listQuestions, createQuestion } from "../api";
import { ArrowLeft, Plus, ChevronLeft, ChevronRight, AlertCircle, X } from "lucide-react";

const PAGE_SIZE = 8;
const DIFFICULTIES = ["easy", "medium", "hard"];

export default function Questions() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // filters
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");

  // pagination
  const [page, setPage] = useState(1);

  // create form
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({
    text: "", option_a: "", option_b: "", option_c: "", option_d: "",
    correct_answer: "", category: "", difficulty: "easy",
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    setLoading(true);
    setError(null);
    try {
      const data = await listQuestions();
      setQuestions(data);
    } catch (err) {
      setError("Failed to load questions.");
    } finally {
      setLoading(false);
    }
  }

  // derive unique categories from loaded questions
  const categories = useMemo(() => {
    const cats = [...new Set(questions.map(q => q.category))].sort();
    return cats;
  }, [questions]);

  // apply filters client-side
  const filtered = useMemo(() => {
    return questions.filter(q => {
      const catMatch = !filterCategory || q.category === filterCategory;
      const diffMatch = !filterDifficulty || q.difficulty === filterDifficulty;
      return catMatch && diffMatch;
    });
  }, [questions, filterCategory, filterDifficulty]);

  // reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [filterCategory, filterDifficulty]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleFilterCategory(val) {
    setFilterCategory(val);
  }

  function handleFilterDifficulty(val) {
    setFilterDifficulty(val);
  }

  function handleFormChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    try {
      const created = await createQuestion(form);
      setQuestions(prev => [created, ...prev]);
      setShowForm(false);
      setForm({ text: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_answer: "", category: "", difficulty: "easy" });
    } catch (err) {
      setFormError(err.detail || "Failed to create question.");
    } finally {
      setFormLoading(false);
    }
  }

  const difficultyColor = { easy: "var(--success)", medium: "#f59e0b", hard: "var(--danger)" };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "24px 16px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
            <ArrowLeft size={20} />
          </button>
          <h2 style={{ margin: 0, flex: 1 }}>Questions</h2>
          <button
            className="btn-primary"
            style={{ width: "auto", padding: "8px 16px", display: "flex", alignItems: "center", gap: 6 }}
            onClick={() => setShowForm(v => !v)}
          >
            <Plus size={16} /> Add Question
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20, marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>New Question</h3>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="field">
                <label>Question text</label>
                <input name="text" value={form.text} onChange={handleFormChange} required minLength={5} placeholder="Question text" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {["option_a","option_b","option_c","option_d"].map(k => (
                  <div className="field" key={k}>
                    <label>Option {k.slice(-1).toUpperCase()}</label>
                    <input name={k} value={form[k]} onChange={handleFormChange} required placeholder={`Option ${k.slice(-1).toUpperCase()}`} />
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div className="field">
                  <label>Correct answer</label>
                  <select name="correct_answer" value={form.correct_answer} onChange={handleFormChange} required>
                    <option value="">Select</option>
                    {["A","B","C","D"].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Category</label>
                  <input name="category" value={form.category} onChange={handleFormChange} required minLength={2} placeholder="e.g. Science" />
                </div>
                <div className="field">
                  <label>Difficulty</label>
                  <select name="difficulty" value={form.difficulty} onChange={handleFormChange} required>
                    {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              {formError && <div className="error-box" style={{ marginBottom: 12 }}><AlertCircle size={14} /> {formError}</div>}
              <button type="submit" className="btn-primary" disabled={formLoading}>{formLoading ? "Saving..." : "Create Question"}</button>
            </form>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <select
            value={filterCategory}
            onChange={e => handleFilterCategory(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "var(--radius)", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 14 }}
          >
            <option value="">All categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={filterDifficulty}
            onChange={e => handleFilterDifficulty(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "var(--radius)", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 14 }}
          >
            <option value="">All difficulties</option>
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <span style={{ fontSize: 13, color: "var(--text-muted)", marginLeft: "auto" }}>
            {filtered.length} question{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        {error && <div className="error-box"><AlertCircle size={14} /> {error}</div>}

        {loading ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>Loading...</div>
        ) : paginated.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>No questions match the filters.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {paginated.map(q => (
              <div key={q.question_id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "14px 16px" }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 99, background: "rgba(99,102,241,0.15)", color: "var(--accent)" }}>{q.category}</span>
                  <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 99, background: "rgba(0,0,0,0.2)", color: difficultyColor[q.difficulty] || "var(--text-muted)" }}>{q.difficulty}</span>
                </div>
                <p style={{ margin: "0 0 10px", fontWeight: 500 }}>{q.text}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {["A","B","C","D"].map((l, i) => (
                    <div key={l} style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", gap: 6 }}>
                      <span style={{ fontWeight: 600, color: "var(--text)" }}>{l}.</span>
                      {[q.option_a, q.option_b, q.option_c, q.option_d][i]}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 24 }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ background: "none", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "6px 10px", cursor: page === 1 ? "not-allowed" : "pointer", color: page === 1 ? "var(--text-muted)" : "var(--text)", display: "flex" }}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setPage(n)}
                style={{ background: n === page ? "var(--accent)" : "none", color: n === page ? "#fff" : "var(--text)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "6px 12px", cursor: "pointer", fontWeight: n === page ? 600 : 400, minWidth: 36 }}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ background: "none", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "6px 10px", cursor: page === totalPages ? "not-allowed" : "pointer", color: page === totalPages ? "var(--text-muted)" : "var(--text)", display: "flex" }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}