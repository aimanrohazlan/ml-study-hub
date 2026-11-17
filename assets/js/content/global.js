/* Global exam-prep material: cheat sheet, formulas, confusions, worked calculations, strategy. */
ML.global.cheat = {
    1: String.raw`<ul>
<li><strong>Samuel 1959</strong>: learn without being explicitly programmed. <strong>Mitchell 1997</strong>: improve P on T with E.</li>
<li>Traditional: rules + data → output. ML: data + outcome → model.</li>
<li>Tasks: classification, regression, anomaly detection, translation, clustering.</li>
<li>Supervision: supervised / unsupervised / reinforcement. Incremental: batch (offline) vs online (mini-batches, out-of-core). Generalisation: instance-based (similarity) vs model-based.</li>
<li>Challenges: insufficient, non-representative or poor-quality data; irrelevant features; overfitting (too complex) vs underfitting (too simple).</li>
<li><strong>KDD</strong>: Selection → Pre-processing → Transformation → Data Mining → Interpretation/Evaluation.</li>
<li><strong>CRISP-DM</strong>: Business → Data Understanding → Data Prep → Modelling → Evaluation → Deployment.</li>
<li><strong>SEMMA</strong> (SAS): Sample → Explore → Modify → Model → Assess.</li></ul>`,
    2: String.raw`<ul>
<li>CRISP-DM = project framework (business). Pipeline = technical workflow (code).</li>
<li><strong>Fit preprocessing on train, apply the same parameters at inference.</strong> Recomputing on test data is leakage.</li>
<li>CSV (tabular), JSON (nested key–value, flatten), XML (tags/content/element/attribute), HTML (crawl → scrape), SQL (queries or ORM).</li>
<li><code>info()</code> = dtypes and non-null counts. <code>describe()</code> = statistics and outliers. Checklist: missing values, duplicates, wrong types, outliers.</li>
<li>Missing: <code>dropna</code> (&lt;1%), <code>fillna</code> mean (normal) / median (outliers), <code>ffill/bfill</code> (time series).</li>
<li>Label encoding implies order. One-hot (<code>get_dummies</code>) doesn't. Min–max gives [0,1]. Z-score gives mean 0, std 1.</li>
<li><code>groupby</code> = split → apply → combine. Line = trend, bar = compare, histogram = distribution, box = outliers, scatter = relationship.</li></ul>`,
    3: String.raw`<ul>
<li>Iterative. Good features beat complex algorithms. Five types: numeric, categorical, text, temporal, image.</li>
<li>Numeric: binarisation, rounding, interactions (degree 2 on a, b gives 5 features), fixed/custom/quantile binning, log and Box-Cox (reduce right skew).</li>
<li>Nominal vs ordinal. One-hot <strong>m</strong>, dummy <strong>m−1 (0s)</strong>, effect <strong>m−1 (−1s)</strong>, hashing <strong>k</strong>.</li>
<li>Text: BoW (counts, no order), n-grams ("not good"), TF-IDF = tf × log(N/df), cosine similarity, LDA topics, word2vec (context).</li>
<li>Temporal: date/time parts, hour bins, UTC, epoch (seconds since 1970), Gregorian ordinal (days since year 1).</li>
<li>Image: (m, n, 3). Y = 0.2125R + 0.7154G + 0.0721B. Histograms, statistics, Canny, HOG, SURF, VBOW, CNN.</li></ul>`,
    4: String.raw`<ul>
<li>Scale-sensitive: KNN, K-means, SVM, linear/logistic, PCA, NN. Trees and forests don't need scaling.</li>
<li>Standard (x−μ)/σ. Min–max (x−min)/(max−min) is outlier-sensitive. Robust (x−median)/IQR.</li>
<li>Selection keeps a subset. Extraction creates new features (PCA). Curse of dimensionality leads to overfitting.</li>
<li><strong>Filter</strong>: min_df/max_df thresholds, VarianceThreshold(.15) kept Gen 1, 3, 5; SelectKBest chi² 30→15 gave 95.09%→95.26%.</li>
<li><strong>Wrapper</strong>: RFE (8 of 15 overlapped with chi²). <strong>Embedded</strong>: random forest importance.</li>
<li>Use a Pipeline so scaler and selector are fitted only on train.</li></ul>`,
    5: String.raw`<ul>
<li>Classification = discrete classes. Regression = continuous values.</li>
<li>Linear Y = mX + c, least squares minimises Σ(y−ŷ)². Multiple = many inputs. Polynomial = powers of x (overfit risk). Logistic = σ(z) = 1/(1+e^{−z}), threshold 0.5.</li>
<li>Tree: root/decision/leaf. Gini impurity 1−Σp² (lower is better). Piano example: split on <strong>Gender</strong>.</li>
<li>Random forest: bootstrap + random features. Vote (classification) or average (regression).</li>
<li>SVM: maximum margin, support vectors, classify correctly first. Large C gives a narrow margin. Kernels linear/poly/<strong>RBF</strong>/sigmoid.</li>
<li>Naïve Bayes: P(c|x) ∝ P(c)ΠP(xᵢ|c), independence assumption, Laplace for zero frequency. Example gives No (0.00703 &gt; 0.00278).</li>
<li>KNN: lazy and non-parametric, odd k, Euclidean distance, <strong>scale</strong>.</li>
<li>ANN: z = Σwx + b, activation, DNN = multiple hidden layers. Backprop: epochs of a forward and a backward phase. XOR needs a hidden layer.</li></ul>`,
    6: String.raw`<ul>
<li>No labels. Three tasks: clustering, association, dimensionality reduction.</li>
<li><strong>K-means</strong> (EM): random centroids → assign to nearest → update mean → repeat. Limits: needs k; sizes/densities/shapes; outliers.</li>
<li><strong>Hierarchical</strong>: agglomerative (bottom-up merge) vs divisive (top-down split). Cut the dendrogram horizontally to choose k.</li>
<li>Support = freq/N. Confidence = supp(A∪B)/supp(A). Lift = conf/supp(B) (&gt;1 positive). Apriori, FP-Growth.</li>
<li>Selection: missing ratio, low variance, high correlation, random forest, backward/forward.</li>
<li>Extraction: factor analysis, <strong>PCA</strong> (PC1 maximum variance, components uncorrelated), ICA (independent), ISOMAP (manifold), t-SNE (visualisation), UMAP (faster, more global structure).</li></ul>`,
    7: String.raw`<ul>
<li>Agent, environment, state, action, reward, policy, episode. Credit assignment problem.</li>
<li>Exploration vs exploitation. ε-greedy: random with probability ε, else argmax Q.</li>
<li>Q-learning: model-free, off-policy, value-based.</li>
<li>Q ← Q + α[r + γ max Q(s′) − Q]. α = learning rate. γ = discount (0 gives greedy).</li>
<li>Q-table: rows = states, columns = actions, start at 0.</li>
<li>Taxi-v3: 500 states (5×5×5×4), 6 actions, +20 / −10 / −1. Encode (3,1,2,0) = 328.</li></ul>`,
    8: String.raw`<ul>
<li>Deep learning learns features end-to-end. Sigmoid (0–1, gates), tanh (−1–1), ReLU (hidden layers).</li>
<li>W ← W − η ∂L/∂W. Epoch, batch, optimiser, loss.</li>
<li>RNN: h_t = tanh(W_x x_t + W_h h_{t−1} + b), shared weights, BPTT, vanishing/exploding gradients.</li>
<li>LSTM: c_t = f⊙c_{t−1} + i⊙c̃, h_t = o⊙tanh(c_t). Additive update mitigates vanishing gradients.</li>
<li>Windows → (samples, time steps, features). MAE/RMSE. Chronological split.</li>
<li>CNN: conv → ReLU → pool → flatten → dense → softmax. Output size ⌊(W−F+2P)/S⌋+1. Parameters (F·F·C+1)·K.</li>
<li>LeNet, AlexNet (2012), ZFNet, GoogLeNet (Inception), VGG (depth, 3×3), ResNet (skip connections). MNIST 28×28×1. CIFAR-10 32×32×3.</li></ul>`
};

ML.global.formulas = [
    { ch: 2, n: 'Min–max scaling', tex: String.raw`x'=\frac{x-x_{min}}{x_{max}-x_{min}}`, w: 'Range [0,1]. Sensitive to outliers.' },
    { ch: 2, n: 'Z-score (standardisation)', tex: String.raw`z=\frac{x-\mu}{\sigma}`, w: 'Mean 0, std 1.' },
    { ch: 4, n: 'Robust scaling', tex: String.raw`x'=\frac{x-\text{median}}{Q_3-Q_1}`, w: 'Not affected by outliers.' },
    { ch: 3, n: 'Log transform', tex: String.raw`y=\log_b(x)`, w: 'Reduces right skew. Needs x > 0.' },
    { ch: 3, n: 'Box-Cox transform', tex: String.raw`y=\begin{cases}\frac{x^\lambda-1}{\lambda}&\lambda\neq0\\ \ln x&\lambda=0\end{cases}`, w: 'Generalised power transform. x > 0.' },
    { ch: 3, n: 'TF-IDF', tex: String.raw`\text{tfidf}(t,d)=\text{tf}(t,d)\cdot\log\frac{N}{\text{df}(t)}`, w: 'Penalises words found in every document.' },
    { ch: 3, n: 'Cosine similarity', tex: String.raw`\cos\theta=\frac{\mathbf a\cdot\mathbf b}{\lVert\mathbf a\rVert\lVert\mathbf b\rVert}`, w: '1 = same direction, 0 = unrelated.' },
    { ch: 3, n: 'Grayscale luminance', tex: String.raw`Y=0.2125R+0.7154G+0.0721B`, w: 'Converts RGB to a single intensity channel.' },
    { ch: 3, n: 'Polynomial features (deg 2)', tex: String.raw`(a,b)\rightarrow(a,\,b,\,a^2,\,ab,\,b^2)`, w: 'Interaction and power terms.' },
    { ch: 4, n: 'Binary feature variance', tex: String.raw`\text{Var}=p(1-p)`, w: 'Maximum 0.25 at p = 0.5. Used by VarianceThreshold.' },
    { ch: 5, n: 'Linear regression', tex: String.raw`\hat y=mX+c`, w: 'm = slope, c = intercept.' },
    { ch: 5, n: 'Least squares (SSE)', tex: String.raw`\text{SSE}=\sum_i(y_i-\hat y_i)^2`, w: 'OLS minimises the squared residuals.' },
    { ch: 5, n: 'Multiple regression', tex: String.raw`\hat y=b_0+b_1x_1+b_2x_2+\dots`, w: 'Several independent variables.' },
    { ch: 5, n: 'Polynomial regression', tex: String.raw`\hat y=b_0+b_1x+b_2x^2+\dots+b_nx^n`, w: 'A curve with one variable.' },
    { ch: 5, n: 'Sigmoid (logistic)', tex: String.raw`\sigma(z)=\frac{1}{1+e^{-z}}`, w: 'Maps to (0,1). σ(0) = 0.5.' },
    { ch: 5, n: 'Gini impurity', tex: String.raw`G=1-\sum_k p_k^2`, w: 'Lower is purer. The lecture\'s "Gini score" is Σp².' },
    { ch: 5, n: 'Weighted Gini of a split', tex: String.raw`G_{split}=\sum_j\frac{n_j}{n}G_j`, w: 'Weight each child by its size.' },
    { ch: 5, n: 'Bayes\' theorem', tex: String.raw`P(c\mid x)=\frac{P(x\mid c)P(c)}{P(x)}`, w: 'Posterior = likelihood × prior / evidence.' },
    { ch: 5, n: 'Naïve Bayes decision', tex: String.raw`P(c\mid X)\propto P(c)\prod_i P(x_i\mid c)`, w: 'Pick the class with the largest value.' },
    { ch: 5, n: 'Laplace smoothing', tex: String.raw`P(x_i\mid c)=\frac{\text{count}+1}{n_c+k}`, w: 'Fixes the zero-frequency problem.' },
    { ch: 5, n: 'Euclidean distance', tex: String.raw`d(p,q)=\sqrt{\sum_i(p_i-q_i)^2}`, w: 'KNN and K-means.' },
    { ch: 6, n: 'Manhattan distance', tex: String.raw`d(p,q)=\sum_i|p_i-q_i|`, w: 'An alternative distance measure.' },
    { ch: 5, n: 'Neuron', tex: String.raw`z=\sum_i w_ix_i+b,\quad a=f(z)`, w: 'Weighted sum + bias, then activation.' },
    { ch: 5, n: 'Perceptron update', tex: String.raw`w\leftarrow w+\eta\,(y^{*}-y)\,x`, w: 'No change if the prediction is correct.' },
    { ch: 6, n: 'Support', tex: String.raw`\text{supp}(X)=\frac{\#\{T\ni X\}}{N}`, w: 'How often the itemset appears.' },
    { ch: 6, n: 'Confidence', tex: String.raw`\text{conf}(A\Rightarrow B)=\frac{\text{supp}(A\cup B)}{\text{supp}(A)}`, w: 'Fraction of A-baskets that also contain B.' },
    { ch: 6, n: 'Lift', tex: String.raw`\text{lift}(A\Rightarrow B)=\frac{\text{conf}(A\Rightarrow B)}{\text{supp}(B)}`, w: '>1 positive, =1 independent, <1 negative.' },
    { ch: 6, n: 'Number of pairwise plots', tex: String.raw`\frac{p(p-1)}{2}`, w: 'p = 100 gives 4,950.' },
    { ch: 7, n: 'Bellman optimality', tex: String.raw`Q^*(s,a)=r+\gamma\max_{a'}Q^*(s',a')`, w: 'Value = immediate reward + discounted best future value.' },
    { ch: 7, n: 'Q-learning update', tex: String.raw`Q(s,a)\leftarrow Q(s,a)+\alpha\big[r+\gamma\max_{a'}Q(s',a')-Q(s,a)\big]`, w: 'α = learning rate, γ = discount.' },
    { ch: 7, n: 'Q-update (alternative form)', tex: String.raw`Q\leftarrow(1-\alpha)Q+\alpha\,(r+\gamma\max_{a'}Q(s',a'))`, w: 'As written in the Taxi-v3 slides.' },
    { ch: 7, n: 'ε-greedy', tex: String.raw`a=\begin{cases}\text{random}&p=\varepsilon\\ \arg\max_aQ(s,a)&p=1-\varepsilon\end{cases}`, w: 'Balances exploration and exploitation.' },
    { ch: 7, n: 'Taxi-v3 state count', tex: String.raw`5\times5\times5\times4=500`, w: 'Positions × passenger locations × destinations.' },
    { ch: 7, n: 'Taxi state encoding', tex: String.raw`((r\cdot5+c)\cdot5+p)\cdot4+d`, w: '(3,1,2,0) gives 328.' },
    { ch: 8, n: 'Gradient descent update', tex: String.raw`W_{new}=W_{old}-\eta\frac{\partial L}{\partial W}`, w: 'η = learning rate.' },
    { ch: 8, n: 'tanh', tex: String.raw`\tanh(x)=\frac{e^x-e^{-x}}{e^x+e^{-x}}`, w: 'Range (−1, 1).' },
    { ch: 8, n: 'ReLU', tex: String.raw`\text{ReLU}(x)=\max(0,x)`, w: 'Range [0, ∞).' },
    { ch: 8, n: 'RNN hidden state', tex: String.raw`h_t=\tanh(W_xx_t+W_hh_{t-1}+b)`, w: 'Weights are shared across time.' },
    { ch: 8, n: 'LSTM forget gate', tex: String.raw`f_t=\sigma(W_fx_t+U_fh_{t-1}+b_f)`, w: 'How much old memory to keep.' },
    { ch: 8, n: 'LSTM input gate & candidate', tex: String.raw`i_t=\sigma(\cdot),\ \ \tilde c_t=\tanh(W_cx_t+U_ch_{t-1}+b_c)`, w: 'What new content to write.' },
    { ch: 8, n: 'LSTM cell update', tex: String.raw`c_t=f_t\odot c_{t-1}+i_t\odot\tilde c_t`, w: 'The additive update helps gradients flow.' },
    { ch: 8, n: 'LSTM hidden state', tex: String.raw`h_t=o_t\odot\tanh(c_t)`, w: 'The output gate doesn\'t change c.' },
    { ch: 8, n: 'Conv output size', tex: String.raw`O=\left\lfloor\frac{W-F+2P}{S}\right\rfloor+1`, w: 'W input, F filter, P padding, S stride.' },
    { ch: 8, n: 'Conv layer parameters', tex: String.raw`(F\cdot F\cdot C_{in}+1)\cdot K`, w: '32 filters of 3×3×3 gives 896.' },
    { ch: 8, n: 'Dense layer parameters', tex: String.raw`n_{in}\cdot n_{out}+n_{out}`, w: '3072 × 100 + 100 = 307,300.' },
    { ch: 8, n: 'Softmax', tex: String.raw`\text{softmax}(z_i)=\frac{e^{z_i}}{\sum_je^{z_j}}`, w: 'Probabilities that sum to 1.' },
    { ch: 8, n: 'MAE / RMSE', tex: String.raw`\tfrac1n\sum|y-\hat y|\ \ ,\ \ \sqrt{\tfrac1n\sum(y-\hat y)^2}`, w: 'Forecast error metrics.' }
];

ML.global.traps = [
    { t: 'Overfitting vs underfitting', a: ['Overfitting', 'Great on training, poor on test. Too complex. Fix: simplify/regularise, more data, less noise.'], b: ['Underfitting', 'Poor on training and test. Too simple. Fix: a more powerful model, better features, less regularisation.'], r: 'More data cures overfitting, not underfitting.', ch: 1 },
    { t: 'Batch vs online learning', a: ['Batch (offline)', 'Trains on all data at once, then only applies what it learned.'], b: ['Online', 'Learns incrementally from instances or mini-batches, on the fly. Out-of-core learning for huge data.'], r: '"Offline" means batch. It doesn\'t mean "without internet".', ch: 1 },
    { t: 'Instance-based vs model-based', a: ['Instance-based', '"Which examples look like this?" Memorise + similarity (KNN).'], b: ['Model-based', '"What relationship can I learn?" Build a model (linear regression).'], r: 'KNN is the textbook instance-based learner.', ch: 1 },
    { t: 'KDD vs CRISP-DM vs SEMMA', a: ['CRISP-DM', 'Starts with Business Understanding, ends with Deployment.'], b: ['SEMMA / KDD', 'SEMMA starts with Sample (SAS tool). KDD starts with Selection, ends with Interpretation.'], r: 'Only CRISP-DM has explicit business and deployment phases.', ch: 1 },
    { t: 'dropna vs fillna', a: ['dropna()', 'Removes the whole row/column with missing values.'], b: ['fillna()', 'Replaces the missing value (mean/median/constant).'], r: 'Use the median, not the mean, when outliers exist.', ch: 2 },
    { t: 'map vs apply vs applymap', a: ['map / applymap', 'Element-wise: map on a Series, applymap on a DataFrame.'], b: ['apply', 'Works on whole rows/columns along an axis.'], r: 'map = Series only.', ch: 2 },
    { t: 'Label encoding vs one-hot', a: ['Label', 'One integer column. Implies a false order for nominal data.'], b: ['One-hot', 'm binary columns. No order. Best for nominal data.'], r: 'Ordinal data can use ordered integers. Nominal data needs one-hot.', ch: 2 },
    { t: 'Stemming vs lemmatisation', a: ['Stemming', 'Heuristic chopping to a root (may not be a real word).'], b: ['Lemmatisation', 'Uses grammar and vocabulary rules to get the dictionary form.'], r: 'Lemmatisation is more accurate but slower.', ch: 2 },
    { t: 'Dummy vs effect coding', a: ['Dummy', 'm−1 columns. Reference category = all 0s.'], b: ['Effect', 'm−1 columns. Reference category = all −1s.'], r: 'One-hot = m columns. Hashing = fixed k.', ch: 3 },
    { t: 'Nominal vs ordinal', a: ['Nominal', 'No order: genre, country, season.'], b: ['Ordinal', 'Order matters: size, education level, Generation.'], r: 'There is no generic function for ordinal mapping; you write a custom dict.', ch: 3 },
    { t: 'Fixed-width vs quantile binning', a: ['Fixed-width', 'Equal-width ranges (decades). Can give empty bins on skewed data.'], b: ['Quantile', 'Equal-count bins from the distribution (pd.qcut).'], r: 'Skewed data calls for quantile binning.', ch: 3 },
    { t: 'BoW vs TF-IDF vs embeddings', a: ['BoW / TF-IDF', 'Sparse counts. TF-IDF down-weights common words. No semantics.'], b: ['Embeddings (word2vec)', 'Dense vectors learned from context. Similar words are close.'], r: 'An IDF of 0 means the word appears in every document.', ch: 3 },
    { t: 'Feature selection vs extraction', a: ['Selection', 'Keeps a subset of the original features, unchanged.'], b: ['Extraction', 'Builds new combined features (PCA, ICA, t-SNE).'], r: 'PCA is extraction, not selection.', ch: 4 },
    { t: 'Filter vs wrapper vs embedded', a: ['Filter', 'Statistics only (variance, chi², correlation). Fast and model-free.'], b: ['Wrapper / embedded', 'Wrapper trains many models (RFE). Embedded gets importance from training (random forest).'], r: 'RFE = wrapper. Random forest importance = embedded.', ch: 4 },
    { t: 'Min–max vs standard vs robust', a: ['Min–max / standard', '[0,1] or mean 0, std 1. Both are pulled by outliers.'], b: ['Robust', 'Median/IQR, so outliers don\'t distort the scale of the other values.'], r: 'Trees don\'t need scaling. KNN and SVM do.', ch: 4 },
    { t: 'Linear vs logistic regression', a: ['Linear', 'Predicts a continuous value. A straight line.'], b: ['Logistic', 'Predicts a class probability via the sigmoid. It is a classifier.'], r: 'Despite its name, logistic regression is classification.', ch: 5 },
    { t: 'Multiple vs polynomial regression', a: ['Multiple', 'Several different input variables (volume, weight).'], b: ['Polynomial', 'One variable raised to several powers (x, x², x³).'], r: 'Both are solved with linear least squares.', ch: 5 },
    { t: 'Gini score vs Gini impurity', a: ['Σp² (lecture "Gini")', 'Higher is purer, so choose the HIGHEST.'], b: ['1 − Σp² (impurity)', 'Lower is purer, so choose the LOWEST.'], r: 'State which one you use. The piano example picks Gender either way.', ch: 5 },
    { t: 'SVM C parameter', a: ['Large C', 'Narrow margin, few training errors, overfitting risk.'], b: ['Small C', 'Wide margin, tolerates errors, smoother boundary.'], r: 'SVM classifies correctly FIRST, then maximises the margin.', ch: 5 },
    { t: 'Bagging (random forest) vs a single tree', a: ['Single tree', 'Interpretable but high variance, so it overfits.'], b: ['Random forest', 'Bootstrap + random features, then vote/average. Lower variance.'], r: 'Classification votes. Regression averages.', ch: 5 },
    { t: 'KNN: lazy & non-parametric', a: ['Lazy', 'No training work, so prediction is slow and costly.'], b: ['Non-parametric', 'No assumption about the data distribution.'], r: '"Lazy" refers to WHEN computation happens, not to quality.', ch: 5 },
    { t: 'K-means vs KNN', a: ['K-means', 'Unsupervised clustering. k = number of clusters.'], b: ['KNN', 'Supervised classification. k = number of neighbours.'], r: 'Same letter k, completely different algorithms.', ch: 6 },
    { t: 'Agglomerative vs divisive', a: ['Agglomerative', 'Bottom-up: each point alone, then merge the closest.'], b: ['Divisive', 'Top-down: one cluster, then split.'], r: 'Agglomerative = "additive".', ch: 6 },
    { t: 'Confidence vs lift', a: ['Confidence', 'P(B | A). Can be high just because B is popular.'], b: ['Lift', 'Confidence ÷ supp(B). Corrects for B\'s popularity.'], r: 'Lift = 1 means no association.', ch: 6 },
    { t: 'PCA vs ICA', a: ['PCA', 'Uncorrelated components, ordered by variance.'], b: ['ICA', 'Statistically independent components (separating signals).'], r: 'Independent is stronger than uncorrelated.', ch: 6 },
    { t: 't-SNE vs UMAP', a: ['t-SNE', 'Great for visualisation. Slow, loses large-scale structure.'], b: ['UMAP', 'Faster, keeps more global structure, scales to large data.'], r: 'Both are non-linear.', ch: 6 },
    { t: 'Exploration vs exploitation', a: ['Exploration', 'Try random/new actions to discover.'], b: ['Exploitation', 'Take the best known action (argmax Q).'], r: 'ε-greedy: ε = probability of exploring.', ch: 7 },
    { t: 'α vs γ in Q-learning', a: ['α: learning rate', 'How much each update overrides the old Q.'], b: ['γ: discount factor', 'How much future rewards matter. γ = 0 is greedy.'], r: 'Don\'t swap them in the update formula.', ch: 7 },
    { t: 'Q-table vs reward table P', a: ['Reward table P', 'Immediate rewards from the environment, fixed.'], b: ['Q-table', 'Learned long-term values, updated by training.'], r: 'Same shape (500×6 in Taxi), different purpose.', ch: 7 },
    { t: 'RNN vs LSTM', a: ['RNN', 'One hidden state. Vanishing gradients on long sequences.'], b: ['LSTM', 'Cell state + gates (forget/input/output). Mitigates vanishing gradients.'], r: 'LSTMs mitigate the problem. They don\'t eliminate it.', ch: 8 },
    { t: 'LSTM cell state vs hidden state', a: ['Cell state c', 'Long-term memory, changed by the forget and input gates.'], b: ['Hidden state h', 'Exposed working output = o ⊙ tanh(c).'], r: 'The output gate does NOT modify c.', ch: 8 },
    { t: 'VALID vs SAME padding', a: ['VALID', 'No padding, so the output shrinks (5×5 → 3×3).'], b: ['SAME', 'Zero border keeps the size (5×5 padded to 7×7 → 5×5).'], r: 'Use ⌊(W − F + 2P)/S⌋ + 1.', ch: 8 },
    { t: 'Max vs average pooling', a: ['Max', 'Keeps the strongest activation and suppresses noise.'], b: ['Average', 'Keeps the mean response.'], r: 'Pooling has NO learnable weights.', ch: 8 },
    { t: 'Sigmoid vs softmax', a: ['Sigmoid', 'One probability (binary). Also LSTM gates.'], b: ['Softmax', 'A probability distribution over many classes, summing to 1.'], r: 'MNIST and CIFAR-10 use a 10-unit softmax output.', ch: 8 }
];

ML.global.calcs = [
    { ch: 2, t: 'Mean vs median imputation', p: 'Prices: 100, 120, NaN, 110, 1000. Impute the NaN.', s: ['Mean of the known values = (100 + 120 + 110 + 1000)/4 = 1330/4 = 332.5', 'Sorted known values: 100, 110, 120, 1000, so median = (110 + 120)/2 = 115', '1000 is about 9× the others, which makes it an outlier that drags the mean up'], a: 'Impute <strong>115</strong> (median).' },
    { ch: 4, t:'Three scalers on video views', p: 'Views = 1, 5, 25, 300, 1295, 19000. Scale 19000 with min–max, z-score and robust.', s: ['Min–max: (19000 − 1)/(19000 − 1) = 1', 'Mean μ = 20626/6 = 3437.67. Population σ ≈ 6974.5. z = (19000 − 3437.67)/6974.5 ≈ 2.23', 'Median = (25 + 300)/2 = 162.5. Q1 = 10, Q3 = 1046.25, so IQR = 1036.25', 'Robust = (19000 − 162.5)/1036.25 ≈ 18.18'], a: 'Min–max <strong>1.0</strong>, z ≈ <strong>2.23</strong>, robust ≈ <strong>18.2</strong> (the slide shows 18.43; it uses a slightly different quartile convention).' },
    { ch: 3, t: 'TF-IDF by hand', p: '3 documents. "sky" appears twice in Doc 1 and in 2 of the 3 documents. Compute tf-idf of "sky" in Doc 1 with idf = log₁₀(N/df).', s: ['tf = 2', 'idf = log₁₀(3/2) = log₁₀(1.5) ≈ 0.176', 'tf-idf = 2 × 0.176'], a: '≈ <strong>0.352</strong>' },
    { ch: 3, t: 'Cosine similarity', p: 'Doc A = [1, 2, 0], Doc B = [2, 1, 1]. Compute the cosine similarity.', s: ['a·b = 1·2 + 2·1 + 0·1 = 4', '|a| = √(1 + 4 + 0) = √5 ≈ 2.236. |b| = √(4 + 1 + 1) = √6 ≈ 2.449', 'cos = 4/(2.236 × 2.449) = 4/5.477'], a: '≈ <strong>0.730</strong>' },
    { ch: 5, t: 'Gini split (piano)', p: 'Gender: Female 10 (0.2 play / 0.8 not), Male 20 (0.65/0.35). Compute the weighted Gini score and impurity.', s: ['Female Σp² = 0.04 + 0.64 = 0.68', 'Male Σp² = 0.4225 + 0.1225 = 0.545', 'Weighted Σp² = (10/30)(0.68) + (20/30)(0.545) = 0.2267 + 0.3633 = 0.59', 'Impurity = 1 − 0.59 = 0.41. The other splits score about 0.51 (impurity about 0.49)'], a: 'Gender: score <strong>0.59</strong> / impurity <strong>0.41</strong>, so <strong>split on Gender</strong>.' },
    { ch: 5, t: 'Naïve Bayes: buy or not', p: 'P(Yes) = 6/10, P(No) = 4/10. Likelihoods Yes: 1/6, 3/6, 2/6, 3/6, 3/6, 4/6. No: 3/4, 1/4, 3/4, 2/4, 2/4, 2/4.', s: ['Yes: (1·3·2·3·3·4)/6⁶ = 216/46656 = 0.004630', '× P(Yes) 0.6 = 0.00278', 'No: (3·1·3·2·2·2)/4⁶ = 72/4096 = 0.017578', '× P(No) 0.4 = 0.00703'], a: '0.00703 &gt; 0.00278, so <strong>Buy = No</strong>.' },
    { ch: 5, t: 'KNN by hand', p: 'Training: A(1,1)=Red, B(2,1)=Red, C(4,3)=Blue, D(5,5)=Blue, E(3,2)=Red. Classify P(3,3) with k = 3.', s: ['d(P,A) = √(4 + 4) = 2.83. d(P,B) = √(1 + 4) = 2.24', 'd(P,C) = √(1 + 0) = 1.00. d(P,D) = √(4 + 4) = 2.83', 'd(P,E) = √(0 + 1) = 1.00', 'Sorted: C 1.00 (Blue), E 1.00 (Red), B 2.24 (Red), A 2.83, D 2.83', 'k = 3 nearest: C, E, B gives 2 Red vs 1 Blue'], a: 'Predict <strong>Red</strong>. (With k = 1 there is a C/E tie at distance 1, which shows why k and tie-breaking matter.)' },
    { ch: 5, t: 'Logistic regression probability', p: 'z = −1 + 0.5x. Find P(class 1) for x = 4.', s: ['z = −1 + 0.5 × 4 = 1', 'σ(1) = 1/(1 + e⁻¹) = 1/(1 + 0.3679)'], a: '≈ <strong>0.731</strong>, so class 1.' },
    { ch: 6, t: 'Support, confidence, lift', p: 'Transactions: {milk,bread}, {bread,diaper,beer,eggs}, {milk,diaper,beer,cola}, {bread,milk,diaper,beer}, {bread,milk,diaper,cola}. Rule {diaper} → {beer}.', s: ['supp(diaper) = 4/5 = 0.8', 'supp(beer) = 3/5 = 0.6', 'supp(diaper ∪ beer) = 3/5 = 0.6', 'conf = 0.6/0.8 = 0.75', 'lift = 0.75/0.6 = 1.25'], a: 'Support <strong>0.6</strong>, confidence <strong>0.75</strong>, lift <strong>1.25</strong> (positive).' },
    { ch: 6, t: 'One K-means iteration', p: '1-D points 1, 2, 6, 8, 9. k = 2, initial centroids 1 and 6.', s: ['Assign: 1 → c1. 2 → c1 (distance 1 vs 4). 6, 8, 9 → c2', 'Update: c1 = (1 + 2)/2 = 1.5. c2 = (6 + 8 + 9)/3 = 7.67', 'Reassign with the new centroids: no change, so converged'], a: 'Clusters <strong>{1, 2}</strong> and <strong>{6, 8, 9}</strong>, centroids 1.5 and 7.67.' },
    { ch: 7, t: 'Q-learning update', p: 'α = 0.9, γ = 0.75, Q(s,a) = 2, r = 5, max Q(s′,·) = 8.', s: ['Target = r + γ·maxQ′ = 5 + 0.75 × 8 = 11', 'TD error = 11 − 2 = 9', 'Q_new = 2 + 0.9 × 9'], a: '<strong>10.1</strong>' },
    { ch: 7, t: 'Q-learning update (exercise)', p: 'α = 0.1, γ = 0.9, Q(s,a) = 0.5, r = −1, max Q(s′,·) = 2.', s: ['Target = −1 + 0.9 × 2 = 0.8', 'Error = 0.8 − 0.5 = 0.3', 'Q_new = 0.5 + 0.1 × 0.3'], a: '<strong>0.53</strong>' },
    { ch: 7, t: 'Taxi-v3 state count and encoding', p: 'Count the states and encode taxi (3,1), passenger at Y (2), destination R (0).', s: ['States = 25 positions × 5 passenger locations × 4 destinations = 500', 'Encode: (3 × 5 + 1) = 16, then 16 × 5 + 2 = 82, then 82 × 4 + 0 = 328'], a: '<strong>500</strong> states. Encoded state <strong>328</strong>.' },
    { ch: 8, t: 'RNN hidden state', p: 'x = 0.5, Wx = 0.8, h_prev = 0.2, Wh = 0.5, b = 0.1.', s: ['z = 0.8 × 0.5 + 0.5 × 0.2 + 0.1 = 0.4 + 0.1 + 0.1 = 0.6', 'h = tanh(0.6)'], a: '≈ <strong>0.537</strong>' },
    { ch: 8, t: 'LSTM cell step', p: 'c_prev = 0.8, f = 0.9, i = 0.6, c̃ = 0.5, o = 0.7.', s: ['Retain: f × c_prev = 0.72', 'Add: i × c̃ = 0.30', 'c_t = 1.02', 'h_t = 0.7 × tanh(1.02) = 0.7 × 0.770'], a: 'c<sub>t</sub> = <strong>1.02</strong>, h<sub>t</sub> ≈ <strong>0.539</strong>' },
    { ch: 8, t: 'CNN output sizes', p: '(a) 7×7, F = 3, S = 1, P = 0. (b) 32×32, F = 5, S = 1, P = 0. (c) 28×28 then 2×2 pool, stride 2.', s: ['(a) (7 − 3)/1 + 1 = 5', '(b) (32 − 5)/1 + 1 = 28', '(c) (28 − 2)/2 + 1 = 14'], a: '<strong>5×5</strong>, <strong>28×28</strong>, <strong>14×14</strong>' },
    { ch: 8, t: 'Conv vs dense parameters', p: '32×32×3 image. (a) Dense layer of 100 units. (b) Conv layer of 32 filters, 3×3.', s: ['(a) 3072 × 100 + 100 = 307,300', '(b) (3 × 3 × 3 + 1) × 32 = 28 × 32 = 896'], a: 'Dense <strong>307,300</strong> vs conv <strong>896</strong>.' },
    { ch: 8, t: 'Max & average pooling', p: 'Input [[12,20,30,0],[8,12,2,0],[34,70,37,4],[112,100,25,12]], 2×2, stride 2.', s: ['Windows: {12,20,8,12}, {30,0,2,0}, {34,70,112,100}, {37,4,25,12}', 'Max: 20, 30, 112, 37', 'Average: 52/4 = 13, 32/4 = 8, 316/4 = 79, 78/4 = 19.5'], a: 'Max <strong>[[20,30],[112,37]]</strong>. Average <strong>[[13,8],[79,19.5]]</strong>.' },
    { ch: 8, t: 'Flatten shape tracking', p: '32×32×1 input → 5×5 conv with 3 filters (valid) → 2×2 pool, stride 2 → flatten.', s: ['Conv: 32 − 5 + 1 = 28, giving 28×28×3', 'Pool: 28/2 = 14, giving 14×14×3', 'Flatten: 14 × 14 × 3'], a: '<strong>588</strong> values' },
    { ch: 8, t: 'Softmax', p: 'Scores z = [2, 1, 0]. Compute the softmax probabilities.', s: ['e² = 7.389, e¹ = 2.718, e⁰ = 1', 'Sum = 11.107', 'Divide each by the sum'], a: '≈ <strong>[0.665, 0.245, 0.090]</strong>, so predict class 1.' }
];

ML.global.strategy = String.raw`
<div class="section"><h3>Assessment weighting (from the course outline)</h3>
<div class="tbl-wrap"><table class="tbl"><tr><th>Component</th><th class="num">%</th></tr>
<tr><td>Test 1</td><td class="num">10</td></tr><tr><td>Test 2</td><td class="num">10</td></tr><tr><td>Project</td><td class="num">20</td></tr><tr><td>Lab assessments</td><td class="num">10</td></tr><tr><td><strong>Final exam</strong></td><td class="num"><strong>50</strong></td></tr></table></div>
<p class="small muted">Attendance is monitored, and missing three sessions without approval can bar you from the final exam.</p></div>

<div class="section"><h3>Answering subjective questions</h3>
<ol class="steps">
<li><strong>Read the verb.</strong> <em>Define</em> = one precise sentence. <em>Explain</em> = what + how + why. <em>Compare/differentiate</em> = a side-by-side table or paired points. <em>Calculate</em> = formula → substitution → answer with units/interpretation.</li>
<li><strong>Match the marks.</strong> Roughly one distinct point per mark. A 6-mark "describe CRISP-DM" means one line per phase.</li>
<li><strong>Use the lecture's own words</strong> for definitions (Samuel, Mitchell, "class-conditional independence", "model-free, off-policy").</li>
<li><strong>Add a tiny example.</strong> One concrete example (house prices, spam, dog training, Taxi) often earns the final mark.</li>
<li><strong>For calculations, show every step.</strong> Write the formula first, then the substitution, then the result. Method marks survive arithmetic slips.</li>
</ol></div>

<div class="section"><h3>Answering MCQs</h3>
<ul>
<li>Eliminate options with absolute words ("always", "never", "guarantees") unless the concept really is absolute.</li>
<li>Look for the <strong>"exam trap" pairs</strong> on the Common Confusions page: batch/online, dummy/effect, PCA/ICA, α/γ, max/average pooling.</li>
<li>For "which is NOT…" questions, re-read the stem after picking your answer.</li>
<li>Numeric MCQs: estimate first (e.g. σ(2) is "a bit below 0.9"), then compute.</li>
</ul></div>

<div class="section"><h3>Highest-yield calculations to drill</h3>
<div class="cards">
<div class="card click" data-nav="calc"><span class="tag">Ch 5</span><p>Gini split · Naïve Bayes · KNN distance · sigmoid</p></div>
<div class="card click" data-nav="calc"><span class="tag">Ch 6</span><p>Support / confidence / lift · K-means iteration</p></div>
<div class="card click" data-nav="calc"><span class="tag">Ch 7</span><p>Q-update · Taxi 500 states and encoding</p></div>
<div class="card click" data-nav="calc"><span class="tag">Ch 8</span><p>Conv output size · parameters · pooling · LSTM step · flatten</p></div>
<div class="card click" data-nav="calc"><span class="tag">Ch 2–4</span><p>Mean vs median · min–max / z / robust · TF-IDF · cosine</p></div>
</div></div>

<div class="section"><h3>A 7-day revision plan</h3>
<div class="tbl-wrap"><table class="tbl">
<tr><th>Day</th><th>Focus</th><th>Do</th></tr>
<tr><td>1</td><td>Ch 1–2</td><td>Lessons → Ch 1 &amp; 2 MCQ prep → frameworks from memory</td></tr>
<tr><td>2</td><td>Ch 3–4</td><td>Encoding table, scalers, filter/wrapper/embedded → subjective Qs</td></tr>
<tr><td>3</td><td>Ch 5 (part 1)</td><td>Regression, trees, Gini, forest → Gini and NB calculations</td></tr>
<tr><td>4</td><td>Ch 5 (part 2)</td><td>SVM, KNN, ANN, XOR → Ch 5 MCQ prep</td></tr>
<tr><td>5</td><td>Ch 6–7</td><td>K-means, association, PCA, Q-learning → calculations</td></tr>
<tr><td>6</td><td>Ch 8</td><td>RNN/LSTM/CNN → shape and parameter drills</td></tr>
<tr><td>7</td><td>Everything</td><td>Formula sheet in recall mode → 40-question simulator → retry mistakes</td></tr>
</table></div></div>
`;
