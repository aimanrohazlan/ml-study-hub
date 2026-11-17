ML.addChapter({
    id: 4,
    title: 'Feature Scaling & Selection',
    short: 'Scaling & Selection',
    lecture: 'Lecture 5',
    color: '#e11d48',
    blurb: 'Standard, min–max and robust scaling; filter, wrapper and embedded feature selection; pipelines that prevent leakage.',
    outcomes: [
        'Explain why feature scaling matters and which algorithms need it',
        'Apply standard, min–max and robust scaling and interpret the results',
        'Distinguish feature selection, engineering and extraction',
        'Apply filter, wrapper and embedded feature-selection methods',
        'Prevent data leakage using pipelines'
    ],
    topics: [
        {
            id: 'scaling', title: 'Why scale, and which algorithms need it',
            html: String.raw`
<p class="lead">Some numeric features are <strong>unbounded</strong> (video view counts, web page hits). Using raw values biases models towards features with <strong>high magnitude</strong>.</p>

<h3>Distance dominance</h3>
<p>Two customers: (age 25, income 45,000) and (age 45, income 46,000). The Euclidean distance is $\sqrt{20^2 + 1000^2} \approx 1000.2$. Age contributes almost nothing, even though a 20-year age gap is large. After scaling, both features contribute fairly.</p>

<div class="vs">
<div><h5>Scale-sensitive: scaling needed</h5><ul><li>KNN and K-means (distances)</li><li>SVM (margins / kernels)</li><li>Linear and logistic regression (especially with regularisation or gradient descent)</li><li>PCA (variance-based)</li><li>Neural networks (gradient descent)</li></ul></div>
<div><h5>Scale-insensitive: works without</h5><ul><li>Decision trees</li><li>Random forests and other tree ensembles</li></ul><p class="small">They split on thresholds of one feature at a time, so magnitude doesn't matter.</p></div>
</div>
<div class="callout tip"><span class="ttl">Lecture advice</span>Even though trees don't need it, it's still recommended to scale, especially if you want to try several algorithms on the same features.</div>

<h3>Video view count dataset</h3>
<p>Five or six videos with view counts from a handful to many thousands give values of very different magnitude. Let's scale them.</p>
`
        },
        {
            id: 'scalers', title: 'Standard, min–max & robust scalers',
            html: String.raw`
<div class="cards">
<div class="card"><span class="tag">StandardScaler · z-score</span>$$z=\frac{x-\mu}{\sigma}$$<p class="small">Removes the mean and scales to unit variance ("centering scaling"). Result: mean 0, std 1. A z of +2.23 means 2.23 standard deviations above the mean.</p></div>
<div class="card"><span class="tag">MinMaxScaler</span>$$x'=\frac{x-\min(x)}{\max(x)-\min(x)}$$<p class="small">Squeezes values into [0, 1]: max → 1, min → 0. <strong>Sensitive to outliers</strong>, because one huge value compresses everything else near 0.</p></div>
<div class="card"><span class="tag">RobustScaler</span>$$x'=\frac{x-\text{median}(x)}{\text{IQR}}$$<p class="small">IQR = Q3 − Q1. Uses statistics that <strong>outliers don't affect</strong>. Outliers remain large rather than squashing other values.</p></div>
</div>

<pre><code>from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler
views = df[["views"]].values.astype(float)
df["zscore"] = StandardScaler().fit_transform(views)
df["minmax"] = MinMaxScaler().fit_transform(views)
df["robust"] = RobustScaler().fit_transform(views)</code></pre>

<div class="vis" data-vis="scalers"></div>

<div class="callout note"><span class="ttl">About the lecture table</span>The slide's table gives z = −0.48/−0.44 for 25/300 and robust = 1.11/18.43 for 1,295/19,000. Recomputing on the six values shown gives −0.49/−0.45 and 1.09/18.18. The small differences come from rounding and quartile conventions. The interpretation is identical.</div>

<h3>Decision guide</h3>
<div class="tbl-wrap"><table class="tbl">
<tr><th>Situation</th><th>Use</th></tr>
<tr><td>Roughly normal data; algorithms that assume centred data (SVM, logistic regression, PCA, NNs)</td><td><strong>StandardScaler</strong></td></tr>
<tr><td>Need bounded [0,1] values (e.g. pixel intensities, NN inputs); no extreme outliers</td><td><strong>MinMaxScaler</strong></td></tr>
<tr><td>Data has significant outliers</td><td><strong>RobustScaler</strong></td></tr>
<tr><td>Strong right skew</td><td>Log / Box-Cox first (Ch. 3), then scale</td></tr>
</table></div>

<details class="check"><summary>Check yourself: values 10, 20, 30, 40, 1000. Which scaler, and what does min–max do to 40?</summary><div><p>Min–max: (40−10)/(1000−10) ≈ 0.03, so the outlier squashes the normal values together. Use <strong>RobustScaler</strong> (median 30, IQR = 40−20 = 20, so 40 → 0.5).</p></div></details>
`
        },
        {
            id: 'selection', title: 'Feature selection: why & the taxonomy',
            html: String.raw`
<div class="tbl-wrap"><table class="tbl">
<tr><th></th><th>What it does</th><th>Example</th></tr>
<tr><td><strong>Feature engineering</strong></td><td>Creates new features from raw data</td><td>Attack × Defense, date → month</td></tr>
<tr><td><strong>Feature selection</strong></td><td>Chooses a <em>subset</em> of existing features. Originals are kept unchanged</td><td>Keep 15 of 30 features</td></tr>
<tr><td><strong>Feature extraction</strong></td><td>Combines features into <em>new</em> lower-dimensional ones</td><td>PCA components</td></tr>
</table></div>

<h3>The curse of dimensionality</h3>
<p>A large number of features leads to the curse of dimensionality: data becomes sparse in high-dimensional space, distances lose meaning, more data is needed, and models <strong>overfit</strong>. The goal is an <strong>optimal number of features</strong> that generalises well.</p>
<div class="cards">
<div class="card"><span class="tag">Benefit</span><p>Less overfitting and better generalisation</p></div>
<div class="card"><span class="tag">Benefit</span><p>Faster training, less memory</p></div>
<div class="card"><span class="tag">Benefit</span><p>Simpler, more interpretable models</p></div>
<div class="card"><span class="tag">Benefit</span><p>Sometimes higher accuracy (removes noise)</p></div>
</div>

<h3>Three families</h3>
<div class="tbl-wrap"><table class="tbl">
<tr><th>Family</th><th>How it selects</th><th>Examples</th><th>Trade-off</th></tr>
<tr><td><strong>Filter</strong></td><td>Purely on metrics (correlation, mutual information, variance, statistical tests), <em>independent of any model</em></td><td>Thresholds, VarianceThreshold, SelectKBest (chi², ANOVA, MI)</td><td>Fast, but ignores feature interactions</td></tr>
<tr><td><strong>Wrapper</strong></td><td>Recursively builds <em>many models</em> on feature subsets and keeps the best-performing subset</td><td>RFE, forward selection, backward elimination</td><td>Captures interactions, but expensive</td></tr>
<tr><td><strong>Embedded</strong></td><td>Uses the model's own training to rank features by importance</td><td>Random forest / tree feature importance, L1 (Lasso)</td><td>Balanced: one model fit, aware of interactions</td></tr>
</table></div>

<details class="check"><summary>Check yourself: you train 30 logistic regressions, each dropping the weakest feature, until 15 remain. Which family?</summary><div><p><strong>Wrapper</strong>. That's Recursive Feature Elimination.</p></div></details>
`
        },
        {
            id: 'filter', title: 'Filter methods',
            html: String.raw`
<h3>Filter 1: thresholding (text document frequency)</h3>
<pre><code>cv = CountVectorizer(min_df=0.1, max_df=0.85, max_features=2000)</code></pre>
<p>Ignores terms in <strong>fewer than 10%</strong> of documents (too rare), ignores terms in <strong>more than 85%</strong> (too common to be informative), and caps the vocabulary at <strong>2000</strong> features.</p>

<h3>Filter 2: unsupervised variance (VarianceThreshold)</h3>
<p>A feature that barely varies carries little information. For one-hot Pokémon Generation columns Gen 1 … Gen 6, a binary feature's variance is $p(1-p)$:</p>
<pre><code>from sklearn.feature_selection import VarianceThreshold
vt = VarianceThreshold(threshold=.15)
vt.fit(poke_gen)            # keeps columns whose variance > 0.15</code></pre>
<p>Result: <strong>Gen 1, Gen 3 and Gen 5</strong> were selected out of the six. This needs no labels.</p>

<h3>Filter 3: supervised univariate statistics</h3>
<p>Score each feature against the target: <strong>chi-square</strong> (non-negative features vs classes), <strong>ANOVA F-test</strong>, <strong>mutual information</strong>. Then keep the top k.</p>
<pre><code>from sklearn.feature_selection import SelectKBest, chi2
skb = SelectKBest(score_func=chi2, k=15)
X_sel = skb.fit_transform(X, y)        # Wisconsin breast cancer: 30 -> 15 features</code></pre>

<div class="callout ex"><span class="ttl">Benchmark: Wisconsin Breast Cancer Diagnostic</span>
<div class="tbl-wrap"><table class="tbl"><tr><th>Model</th><th>Features</th><th class="num">Accuracy</th></tr>
<tr><td>Logistic regression</td><td>All 30</td><td class="num">95.09%</td></tr>
<tr><td>Logistic regression</td><td>Top 15 (chi²)</td><td class="num hl">95.26%</td></tr></table></div>
Half the features gave slightly <strong>better</strong> accuracy, plus a simpler, faster model.</div>

<details class="check"><summary>Check yourself: a binary feature is 1 in 95% of rows. Variance? Kept at threshold 0.15?</summary><div><p>0.95 × 0.05 = 0.0475 &lt; 0.15, so it is <strong>removed</strong>. (Maximum binary variance is 0.25, at p = 0.5.)</p></div></details>
`
        },
        {
            id: 'wrapper', title: 'Wrapper & embedded methods, pipelines',
            html: String.raw`
<h3>Wrapper: Recursive Feature Elimination (RFE)</h3>
<ol class="steps"><li>Fit a model estimator (e.g. logistic regression) on all features.</li><li>Rank features by the model's coefficients/importance.</li><li>Eliminate the lowest-scored feature(s).</li><li>Repeat until the requested number of features remains.</li></ol>
<pre><code>from sklearn.feature_selection import RFE
rfe = RFE(estimator=LogisticRegression(), n_features_to_select=15, step=1)
rfe.fit(X, y);  rfe.support_   # boolean mask of selected features</code></pre>
<p>In the lecture, <strong>8 of 15</strong> features were common to RFE and chi². Different methods <strong>disagree</strong> because they measure usefulness differently.</p>

<h3>Embedded: model-based selection</h3>
<p>Tree-based models (decision trees, <strong>random forests</strong>) compute feature importance <em>while training</em>. Rank features, then keep the top n with a threshold.</p>
<pre><code>rf = RandomForestClassifier(n_estimators=100).fit(X, y)
top10 = np.argsort(rf.feature_importances_)[::-1][:10]</code></pre>

<h3>Preventing data leakage with pipelines</h3>
<p>Scaling and selection must be <strong>fitted on training data only</strong>. If you select features using the whole dataset and then cross-validate, the test folds have already influenced the selection, which inflates scores.</p>
<pre><code>from sklearn.pipeline import Pipeline
pipe = Pipeline([
    ("scale",  StandardScaler()),
    ("select", SelectKBest(f_classif, k=15)),   # ANOVA F; chi2 would fail on negative scaled values
    ("model",  LogisticRegression())
])
pipe.fit(X_train, y_train)          # every step fitted on train only
pipe.score(X_test, y_test)          # test only transformed</code></pre>

<h3>Scaling vs selection</h3>
<div class="vs">
<div><h5>Scaling</h5><p>Changes the <strong>values</strong> of features. Keeps all features.</p></div>
<div><h5>Selection</h5><p>Changes <strong>which</strong> features exist. Values unchanged.</p></div>
</div>

<div class="callout trap"><span class="ttl">Mistakes to avoid</span><ul><li>Fitting the scaler or selector on the full dataset before splitting (leakage).</li><li>Using min–max scaling when there are strong outliers.</li><li>Using chi² on negative values (it needs non-negative features).</li><li>Assuming different selection methods will agree.</li><li>Removing features purely statistically without domain sense.</li></ul></div>
`
        }
    ],
    notes: String.raw`
<h3>1. Feature scaling</h3>
<p>Unbounded features with large magnitudes dominate scale-sensitive models: KNN, K-means, SVM, linear/logistic regression, PCA, neural networks. Tree-based models don't need scaling, but scaling is still recommended when comparing several algorithms.</p>
<ul>
<li><strong>StandardScaler</strong>: $z=(x-\mu)/\sigma$, giving mean 0 and std 1.</li>
<li><strong>MinMaxScaler</strong>: $(x-\min)/(\max-\min)$, giving [0,1]. Outliers compress the other values.</li>
<li><strong>RobustScaler</strong>: $(x-\text{median})/\text{IQR}$, which outliers don't affect.</li>
</ul>
<p>Video views (1 … 19,000): z = 2.23 for 19,000, min–max = 1 for 19,000 and about 0 for the rest, robust ≈ 18 for 19,000.</p>

<h3>2. Feature selection</h3>
<p>Selection keeps a subset of the original features. Extraction creates new combined features (PCA). Engineering derives new features. Many features bring the <strong>curse of dimensionality</strong> and overfitting.</p>
<ul>
<li><strong>Filter</strong> (model-independent metrics): document-frequency thresholds (<code>min_df=0.1, max_df=0.85, max_features=2000</code>); <code>VarianceThreshold(.15)</code> kept Gen 1, 3, 5; <code>SelectKBest(chi2, k=15)</code> on breast cancer went from 30 to 15 features, with LR accuracy rising from 95.09% to 95.26%.</li>
<li><strong>Wrapper</strong> (build models on subsets): <strong>RFE</strong> recursively removes the weakest features. 8 of its 15 picks were common with chi².</li>
<li><strong>Embedded</strong> (importance from training): random forest <code>feature_importances_</code>.</li>
</ul>
<p>Put scaling, selection and the model in a <strong>Pipeline</strong> so that every step is fitted on training data only, which prevents leakage.</p>
`,
    subjective: [
        { q: 'Why is feature scaling important? Name TWO algorithms that require it and ONE that does not, with reasons.', m: 5, a: String.raw`<p>Raw features can be unbounded and of very different magnitudes (e.g. view counts vs ratings). Scale-sensitive models become biased towards high-magnitude features, which then dominate distances, gradients or coefficients.</p><p><strong>Require scaling</strong>: <em>KNN</em>, because it uses Euclidean distance and large-scale features dominate. <em>SVM</em>, because margin and kernel computations depend on distances (also logistic regression, K-means, PCA, neural networks).</p><p><strong>Does not require it</strong>: <em>decision tree / random forest</em>, because each split thresholds one feature at a time, so rescaling a feature doesn't change which split is best.</p>` },
        { q: 'Compare StandardScaler, MinMaxScaler and RobustScaler: formula, output and when to use each.', m: 6, a: String.raw`<ul><li><strong>StandardScaler</strong>: $z=(x-\mu)/\sigma$. Mean 0, std 1, unbounded. Use for roughly normal data and for algorithms assuming centred data (SVM, logistic regression, PCA).</li><li><strong>MinMaxScaler</strong>: $(x-\min)/(\max-\min)$. Range [0,1]. Use when bounded inputs are needed and there are no extreme outliers. An outlier squashes the other values towards 0.</li><li><strong>RobustScaler</strong>: $(x-\text{median})/\text{IQR}$. Centred on the median, and outliers don't affect the scale. Use when the data contains significant outliers.</li></ul>` },
        { q: 'Distinguish filter, wrapper and embedded feature selection methods, giving one example of each.', m: 6, a: String.raw`<p><strong>Filter</strong> methods select features using statistical metrics (correlation, variance, chi², mutual information) independently of any model. They are fast but ignore interactions. Example: SelectKBest with chi², or VarianceThreshold.</p><p><strong>Wrapper</strong> methods recursively build many models on feature subsets and keep the subset giving the best model. They capture interactions but are computationally expensive. Example: Recursive Feature Elimination (RFE).</p><p><strong>Embedded</strong> methods use the model's own training to rank features by importance, combining the benefits of both. Example: random forest feature importance.</p>` },
        { q: 'Explain the curse of dimensionality and how feature selection helps.', m: 4, a: String.raw`<p>As the number of features grows, the feature space becomes exponentially larger and the data becomes sparse. Much more data is needed to cover the space, distances become less meaningful, and models tend to overfit by memorising noise in irrelevant dimensions.</p><p>Feature selection keeps an optimal subset of informative features. This reduces overfitting, improves generalisation, speeds up training and makes models easier to interpret. In the lecture, 15 of 30 features gave slightly higher accuracy (95.26% vs 95.09%).</p>` },
        { q: 'Describe how Recursive Feature Elimination (RFE) works.', m: 4, a: String.raw`<p>RFE is a wrapper method. (1) Train an estimator such as logistic regression on all features. (2) Rank features by importance (coefficient magnitude or feature importance). (3) Remove the lowest-ranked feature(s), with the step size controlling how many. (4) Retrain on the remaining features and repeat until the requested number (e.g. 15) remains. <code>support_</code> shows which features were kept.</p>` },
        { q: 'How can a pipeline prevent data leakage during scaling and feature selection?', m: 4, a: String.raw`<p>Leakage occurs if the scaler or selector is fitted on the full dataset (including test data) before splitting or cross-validation. The test data then influences the scaling parameters or the chosen features, and scores are inflated.</p><p>An sklearn <code>Pipeline</code> chains the steps (scaler → selector → model). Calling <code>fit</code> on training data fits every step only on that data. On test data or each CV fold, the pipeline only <em>transforms</em> with the learned parameters, so no test information leaks in.</p>` }
    ],
    mcq: [
        { q: 'Which model typically does NOT require feature scaling?', o: ['KNN', 'SVM', 'Random forest', 'Logistic regression with regularisation'], a: 2, e: 'Tree splits threshold one feature at a time, so magnitude doesn\'t matter.' },
        { q: 'StandardScaler transforms a feature so that it has:', o: ['Range [0,1]', 'Mean 0 and standard deviation 1', 'Median 0 and IQR 1', 'All positive values'], a: 1, e: 'z = (x − μ)/σ.' },
        { q: 'With MinMaxScaler, the maximum value of a feature becomes:', o: ['0', '0.5', '1', 'Its z-score'], a: 2, e: 'The max maps to 1 and the min to 0.' },
        { q: 'Which scaler is least affected by outliers?', o: ['MinMaxScaler', 'StandardScaler', 'RobustScaler', 'None of them'], a: 2, e: 'It uses the median and IQR, which outliers don\'t affect.' },
        { q: 'Views 1, 5, 25, 300, 1295, 19000 are min–max scaled. The value for 300 is about:', o: ['0.016', '0.30', '0.5', '−0.44'], a: 0, e: '(300 − 1)/(19000 − 1) ≈ 0.0157.' },
        { q: 'The RobustScaler formula is:', o: ['(x − mean)/std', '(x − min)/(max − min)', '(x − median)/IQR', 'log(x)'], a: 2, e: 'IQR = Q3 − Q1.' },
        { q: 'Choosing a subset of the ORIGINAL features without changing them is:', o: ['Feature extraction', 'Feature selection', 'Feature engineering', 'Feature scaling'], a: 1, e: 'Extraction (e.g. PCA) creates new combined features.' },
        { q: 'Which is a FILTER method?', o: ['RFE', 'Random forest importance', 'SelectKBest with chi²', 'Forward selection'], a: 2, e: 'It scores features with a statistical test, independent of a model.' },
        { q: 'Which is a WRAPPER method?', o: ['VarianceThreshold', 'Recursive Feature Elimination', 'Mutual information', 'Correlation threshold'], a: 1, e: 'RFE repeatedly trains models on shrinking feature subsets.' },
        { q: 'Random forest feature importance used for selection is an example of:', o: ['Filter', 'Wrapper', 'Embedded', 'Extraction'], a: 2, e: 'Importance is computed as part of model training.' },
        { q: 'CountVectorizer(min_df=0.1, max_df=0.85) ignores terms that appear in:', o: ['More than 10% and fewer than 85% of documents', 'Fewer than 10% or more than 85% of documents', 'Exactly 10% of documents', 'Only stopwords'], a: 1, e: 'It drops terms that are too rare or too common.' },
        { q: 'VarianceThreshold is an unsupervised method because:', o: ['It uses the target labels', 'It only looks at each feature\'s variance, not the target', 'It trains a model', 'It uses clustering'], a: 1, e: 'Low-variance features carry little information.' },
        { q: 'A binary feature that is 1 in half of the rows has variance:', o: ['0.5', '0.25', '1', '0'], a: 1, e: 'p(1 − p) = 0.5 × 0.5 = 0.25, the maximum for a binary feature.' },
        { q: 'On the breast cancer dataset, logistic regression with 15 chi²-selected features vs all 30 features:', o: ['Was much worse', 'Was slightly better (95.26% vs 95.09%)', 'Could not be trained', 'Had identical coefficients'], a: 1, e: 'Fewer, better features can improve accuracy.' },
        { q: 'The main drawback of wrapper methods is:', o: ['They ignore feature interactions', 'They are computationally expensive', 'They cannot be used for classification', 'They need unlabelled data'], a: 1, e: 'They train many models.' },
        { q: 'Fitting a scaler on the full dataset before the train/test split causes:', o: ['Underfitting', 'Data leakage', 'The curse of dimensionality', 'Feature hashing'], a: 1, e: 'Test-set statistics influence training. Use a Pipeline.' },
        { q: 'The curse of dimensionality mainly leads to:', o: ['Faster training', 'Overfitting and sparse data', 'Better generalisation', 'Smaller models'], a: 1, e: 'More dimensions mean sparser data and more overfitting risk.' },
        { q: 'RFE and chi² selected 15 features each and 8 were common. This shows:', o: ['One method has a bug', 'Different methods measure usefulness differently and can disagree', 'Only 8 features matter', 'Selection is random'], a: 1, e: 'Each method has its own criterion.' }
    ]
});
