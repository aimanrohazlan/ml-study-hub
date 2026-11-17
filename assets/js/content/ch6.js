ML.addChapter({
    id: 6,
    title: 'Unsupervised Learning',
    short: 'Unsupervised Learning',
    lecture: 'Lecture 8',
    color: '#7c3aed',
    blurb: 'K-means and hierarchical clustering, association rules (support, confidence, lift), and dimensionality reduction from filters to PCA, t-SNE and UMAP.',
    outcomes: [
        'Explain unsupervised learning and how its pipeline differs from supervised learning',
        'Apply K-means and hierarchical clustering; read a dendrogram',
        'Compute support, confidence and lift for association rules',
        'Select appropriate dimensionality-reduction techniques (selection vs extraction)'
    ],
    topics: [
        {
            id: 'intro', title: 'What unsupervised learning is',
            html: String.raw`
<p class="lead">Unsupervised learning looks for <strong>previously undetected patterns</strong> in a dataset with <strong>no pre-existing labels</strong> and minimal human supervision. It extracts patterns, relationships, associations and clusters.</p>

<div class="vs">
<div><h5>Supervised</h5><p>Labelled data (x, y). Learns x → y. Accuracy can be measured directly against the labels.</p></div>
<div><h5>Unsupervised</h5><p>Only x. Finds structure in x. No "right answer" to check against, so a human interprets the results.</p></div>
</div>

<h3>Three questions we can ask without labels</h3>
<div class="cards">
<div class="card"><span class="tag">Clustering</span><p>Which observations <strong>belong together</strong>? (customer segments)</p></div>
<div class="card"><span class="tag">Association</span><p>Which items <strong>occur together</strong>? (market baskets)</p></div>
<div class="card"><span class="tag">Dimensionality reduction</span><p>Can we describe the data with <strong>fewer variables</strong>? (PCA, t-SNE)</p></div>
</div>
<p><strong>Applications</strong>: customer segmentation, recommendation and market-basket analysis, anomaly/fraud detection, document grouping, image compression, visualising high-dimensional data.</p>

<h3>The unsupervised pipeline</h3>
<div class="flow arrows"><span>Training data<small>no labels</small></span><span>Feature engineering, scaling, selection<small>same as supervised</small></span><span>Unsupervised algorithm</span><span>Model</span></div>
<p>In prediction, extract features from new samples and pass them through the model to get the result for the task: a <strong>cluster</strong>, a <strong>pattern</strong>, an <strong>association rule</strong>, or a <strong>reduced representation</strong>. <em>Data preparation still matters</em>: scaling in particular changes which points look "close".</p>

<h3>Disadvantages</h3>
<ol>
<li>You can't get precise information about data sorting, because the output classes are not known in advance.</li>
<li>Results are less accurate, because the input isn't labelled by people in advance and the machine must do it itself.</li>
<li>Spectral classes don't always correspond to informational classes (in remote sensing, a cluster may not match a meaningful category).</li>
<li>The user must spend time interpreting and labelling the resulting classes.</li>
<li>Spectral properties of classes can change over time, so class information may not carry over from one image to another.</li>
</ol>
`
        },
        {
            id: 'kmeans', title: 'Clustering & K-means',
            html: String.raw`
<p class="lead"><strong>Clustering</strong> identifies distinct groups (clusters) based on some notion of <strong>similarity</strong>. The most popular techniques are <strong>K-means</strong> (divisive/partitional) and <strong>hierarchical</strong> (agglomerative).</p>

<h3>Measuring similarity</h3>
<p>Usually a distance: Euclidean $\sqrt{\sum (p_i-q_i)^2}$ or Manhattan $\sum|p_i-q_i|$. Small distance means similar. <strong>Scaling changes clustering</strong>: unscaled, a feature like income (thousands) decides all the distances and age is ignored.</p>
<p><strong>Families of clustering methods</strong>: partitional/centroid-based (K-means), hierarchical (agglomerative, divisive), density-based (e.g. DBSCAN), and distribution-based (e.g. Gaussian mixtures).</p>

<h3>K-means</h3>
<p>Goal: <strong>high intra-cluster similarity, low inter-cluster similarity</strong>. Each item belongs to exactly <strong>one</strong> cluster, so it produces k <strong>disjoint, non-hierarchical</strong> clusters. It uses divide and conquer and is a classic <strong>Expectation–Maximisation (EM)</strong> algorithm:</p>
<div class="two">
<div class="card"><h5>E-step: assign</h5><p>Assign every point to its <strong>nearest centroid</strong>.</p></div>
<div class="card"><h5>M-step: update</h5><p>Recompute each centroid as the <strong>mean</strong> (arithmetic average position) of its points.</p></div>
</div>
<ol class="steps">
<li>Choose k and pick k centroids at <strong>random</strong> (first iteration only).</li>
<li>Assign each point to the nearest centroid.</li>
<li>Recalculate each centroid as the average of the coordinates of its cluster's points.</li>
<li>Repeat steps 2–3 until the clusters <strong>converge</strong> (assignments stop changing).</li>
</ol>

<div class="vis" data-vis="kmeans"></div>

<h3>Limitations</h3>
<div class="callout trap"><span class="ttl">K-means limitations</span><ol><li>The <strong>number of clusters k must be specified</strong> in advance.</li><li>Struggles with clusters of <strong>differing sizes, densities and non-globular (non-spherical) shapes</strong>.</li><li><strong>Outliers</strong> can skew the results, because they pull centroids (means) away.</li></ol>Also: random initialisation can give different results, so run several times (k-means++). To choose k, a common approach is the <strong>elbow method</strong> (plot within-cluster sum of squares against k).</div>

<div class="callout ex"><span class="ttl">Case study: income and loan amount</span>Customers plotted by income vs loan amount have no labels. K-means groups them into income/loan segments (e.g. low-income small loans, mid-income medium loans, high-income large loans), so the bank can tailor products to each group. The lecture's result was illustrative synthetic data.</div>

<details class="check"><summary>Check yourself: points 2, 4, 10, 12 (1-D), k = 2, initial centroids 2 and 4. What happens after one iteration?</summary><div><p>Assign: 2 → c₁(2). 4, 10, 12 → c₂(4) (10 is 6 from 4 and 8 from 2). Update: c₁ = 2, c₂ = (4+10+12)/3 ≈ 8.67. Iteration 2: 4 is now closer to c₁ (2 vs 4.67), so c₁ = 3 and c₂ = 11. It converges to {2, 4} and {10, 12}.</p></div></details>
`
        },
        {
            id: 'hierarchical', title: 'Hierarchical clustering & dendrograms',
            html: String.raw`
<p class="lead">Builds a <strong>hierarchy of clusters</strong>, so you don't fix k beforehand. There are two types:</p>
<div class="vs">
<div><h5>Agglomerative: bottom-up</h5><p>Start with <strong>each point as its own cluster</strong> (n clusters). At each iteration, <strong>merge the closest pair</strong>. Repeat until one cluster remains. Also called <strong>additive</strong> hierarchical clustering.</p></div>
<div><h5>Divisive: top-down</h5><p>Start with <strong>all points in one cluster</strong>. At each step, <strong>split</strong> a cluster. Repeat until each point is alone (or a stopping rule applies).</p></div>
</div>

<h3>Example: four points</h3>
<div class="flow arrows"><span>{A} {B} {C} {D}<small>4 clusters</small></span><span>{A,B} {C} {D}<small>merge closest</small></span><span>{A,B} {C,D}</span><span>{A,B,C,D}<small>1 cluster</small></span></div>

<h3>Linkage: distance between clusters</h3>
<div class="tbl-wrap"><table class="tbl"><tr><th>Linkage</th><th>Distance between clusters =</th></tr>
<tr><td>Single</td><td>Closest pair of points</td></tr><tr><td>Complete</td><td>Farthest pair of points</td></tr>
<tr><td>Average</td><td>Average of all pairwise distances</td></tr><tr><td>Ward</td><td>Increase in within-cluster variance (common default)</td></tr></table></div>

<h3>Reading a dendrogram</h3>
<div class="vis" data-vis="dendro"></div>
<ul>
<li>The <strong>leaves</strong> at the bottom are individual observations.</li>
<li>The <strong>height</strong> of a merge is the distance at which the two clusters joined. Low merges mean very similar.</li>
<li>To get k clusters, <strong>cut horizontally</strong>. The number of vertical lines the cut crosses is the number of clusters.</li>
<li>A good cut goes through the <strong>longest vertical gap</strong> with no merges.</li>
</ul>

<div class="callout ex"><span class="ttl">Case study: wholesale customers</span>Annual spending of each client on Fresh, Milk, Grocery, Frozen, Detergents and Delicatessen. Normalise, build an agglomerative dendrogram (Ward), and cut it to segment similar clients, e.g. two groups: retail-like vs hotel/restaurant/café-like buyers.</div>

<div class="vs"><div><h5>vs K-means</h5><ul><li>No k needed up front, since you choose it by cutting</li><li>Gives an interpretable tree</li></ul></div><div><h5>Drawbacks</h5><ul><li>Slow on large n (pairwise distances)</li><li>Merges or splits can't be undone</li></ul></div></div>
`
        },
        {
            id: 'association', title: 'Association rule mining',
            html: String.raw`
<p class="lead">A <strong>rule-based</strong> method for discovering interesting relations between variables in large databases, using measures of interestingness. It rests on the idea that customer purchase behaviour has exploitable patterns. A rule looks like $\{\text{item}_1,\dots\}\Rightarrow\{\text{item}_k\}$, e.g. {beer} → {diaper}.</p>

<h3>Vocabulary</h3>
<ul>
<li><strong>Transaction</strong>: one row, e.g. a customer bought {milk, bread}.</li>
<li><strong>Itemset</strong>: a collection of one or more items occurring together, e.g. {milk, bread}. A transaction <em>supports</em> an itemset even if it has extra items: {milk, bread, eggs} supports {milk, bread}.</li>
<li><strong>Frequent itemset</strong>: support ≥ a user-defined minimum support threshold.</li>
</ul>

<h3>The three measures</h3>
<div class="cards">
<div class="card"><span class="tag">Support</span>$$\text{supp}(X)=\frac{\#\text{transactions containing }X}{\#\text{transactions}}$$<p class="small">How often the itemset appears.</p></div>
<div class="card"><span class="tag">Confidence</span>$$\text{conf}(A\Rightarrow B)=\frac{\text{supp}(A\cup B)}{\text{supp}(A)}$$<p class="small">Of the baskets with A, the fraction that also have B.</p></div>
<div class="card"><span class="tag">Lift</span>$$\text{lift}(A\Rightarrow B)=\frac{\text{conf}(A\Rightarrow B)}{\text{supp}(B)}$$<p class="small">&gt;1 positive association, =1 independent, &lt;1 negative.</p></div>
</div>

<div class="vis" data-vis="assoc"></div>

<div class="callout trap"><span class="ttl">High confidence can be misleading</span>If B is in almost every basket (e.g. bread in 90%), then A → B has high confidence for <em>any</em> A, simply because B is popular. Always check <strong>lift</strong>. Confidence 0.9 with supp(B) = 0.9 gives lift = 1, meaning there's no real association.</div>

<h3>Algorithms for discovering rules</h3>
<ul>
<li><strong>Apriori</strong>: uses the property that <em>every subset of a frequent itemset must be frequent</em>. It grows itemsets level by level and prunes candidates with infrequent subsets.</li>
<li><strong>FP-Growth</strong>: compresses the transactions into an FP-tree and mines frequent itemsets without generating candidates, so it's faster.</li>
<li>Then rules are generated from frequent itemsets and kept if confidence ≥ the threshold (and lift &gt; 1).</li>
</ul>

<details class="check"><summary>Classroom exercise: 5 transactions: {milk, bread}, {bread, diaper, beer, eggs}, {milk, diaper, beer, cola}, {bread, milk, diaper, beer}, {bread, milk, diaper, cola}. Compute support, confidence and lift for {diaper} → {beer}.</summary><div><p>supp(diaper) = 4/5 = 0.8. supp(beer) = 3/5 = 0.6. supp(diaper ∪ beer) = 3/5 = 0.6.</p><p>conf = 0.6/0.8 = <strong>0.75</strong>. lift = 0.75/0.6 = <strong>1.25</strong> (&gt;1, a positive association).</p></div></details>
`
        },
        {
            id: 'dimred', title: 'Dimensionality reduction: selection methods',
            html: String.raw`
<p class="lead">Transforming data from a <strong>high-dimensional</strong> space into a <strong>low-dimensional</strong> one that keeps meaningful properties, ideally close to its intrinsic dimension.</p>
<p>With p = 100 variables there are 100(100−1)/2 = <strong>4,950</strong> pairwise scatter plots (the slide rounds this to "5000"). It makes no sense to inspect each one, so select a smaller set (p &lt; 100) that captures as much information as possible.</p>

<h3>Why reduce dimensions?</h3>
<div class="cards"><div class="card"><p>Less storage and faster computation</p></div><div class="card"><p>Removes redundant, correlated features (multicollinearity)</p></div><div class="card"><p>Helps avoid the curse of dimensionality and overfitting</p></div><div class="card"><p>Makes visualisation in 2-D/3-D possible</p></div></div>

<div class="vs">
<div><h5>Feature selection</h5><p>Keep a <strong>subset of the original</strong> variables. Missing value ratio, low variance, high correlation, random forest, backward elimination, forward selection.</p></div>
<div><h5>Feature extraction</h5><p>Create <strong>new combined</strong> variables. Factor analysis, PCA, ICA, ISOMAP, t-SNE, UMAP.</p></div>
</div>

<h3>Selection techniques</h3>
<div class="tbl-wrap"><table class="tbl">
<tr><th>Technique</th><th>Idea</th><th>Labels?</th></tr>
<tr><td><strong>Missing value ratio</strong></td><td>Drop variables with too many missing values (above a threshold), after investigating why they're missing</td><td>No</td></tr>
<tr><td><strong>Low variance filter</strong></td><td>A variable whose observations are all the same (e.g. all 1) has zero variance and can't help. Drop low-variance variables</td><td>No</td></tr>
<tr><td><strong>High correlation filter</strong></td><td>Highly correlated variables carry similar information and hurt models such as linear/logistic regression. If the correlation exceeds a threshold, drop one (using domain sense)</td><td>No</td></tr>
<tr><td><strong>Random forest</strong></td><td>Built-in feature importance. Keep the top features</td><td>Yes</td></tr>
<tr><td><strong>Backward feature elimination</strong></td><td>Train with all n variables. Drop each one in turn (n models of n−1 variables). Remove the variable whose removal changes performance least. Repeat until none can be dropped</td><td>Yes</td></tr>
<tr><td><strong>Forward feature selection</strong></td><td>Train n single-feature models and keep the best. Add one variable at a time, keeping the one that gives the biggest improvement. Stop when there's no significant improvement</td><td>Yes</td></tr>
</table></div>

<details class="check"><summary>Check yourself: Income and Education are correlated at 0.92. What does the high-correlation filter suggest?</summary><div><p>Drop <em>one</em> of them (choosing with domain knowledge), because they carry largely the same information.</p></div></details>
`
        },
        {
            id: 'pca', title: 'PCA, ICA, t-SNE & UMAP',
            html: String.raw`
<h3>Factor analysis</h3>
<p>Variables are grouped by their correlations. Variables within a group correlate highly with each other but weakly with other groups. Each group is a <strong>factor</strong>, e.g. Income and Education may load on one "socio-economic" factor.</p>

<h3>Principal Component Analysis (PCA)</h3>
<p>Extracts a new set of variables, the <strong>principal components</strong>, from a large set of variables.</p>
<ul>
<li>Each principal component is a <strong>linear combination</strong> of the original variables.</li>
<li><strong>PC1</strong> explains the <strong>maximum variance</strong> in the dataset.</li>
<li><strong>PC2</strong> explains the remaining variance and is <strong>uncorrelated</strong> with PC1 (orthogonal).</li>
<li>PC3 explains variance not explained by PC1 and PC2, and so on.</li>
</ul>
<div class="vis" data-vis="pca"></div>
<p><strong>Steps</strong>: standardise the data → compute the covariance matrix → find eigenvectors (directions) and eigenvalues (variance along each) → sort by eigenvalue → keep the top components that explain enough variance (e.g. 95%) → project the data onto them.</p>
<div class="callout ex"><span class="ttl">Interpreting PCA output</span>If PC1 explains 72% and PC2 18% of the variance, two components keep <strong>90%</strong> of the information. You can drop from, say, 10 features to 2 and still plot the data.</div>
<div class="callout trap"><span class="ttl">Scale first</span>PCA chases variance. An unscaled feature with a huge range will dominate PC1 just because of its units.</div>

<h3>Independent Component Analysis (ICA)</h3>
<p>Based on information theory. <strong>PCA looks for uncorrelated factors, ICA looks for independent factors.</strong> Uncorrelated means no <em>linear</em> relation. Independent means no dependence of any kind. A classic use is separating mixed signals (the "cocktail party" problem).</p>

<h3>Non-linear methods</h3>
<div class="cards">
<div class="card"><span class="tag">ISOMAP</span><p>Isometric embedding. Use when there is a <strong>non-linear mapping</strong> between the high-dimensional data and a lower-dimensional manifold (e.g. data on a sphere or a "swiss roll"). Preserves geodesic distances.</p></div>
<div class="card"><span class="tag">t-SNE</span><p>t-Distributed Stochastic Neighbor Embedding. Computes probability similarities of points in high- and low-dimensional space. Retains both local and global structure (per the lecture), and is mainly for <strong>visualisation</strong>. Limits: loses large-scale information, slow, struggles with very large datasets.</p></div>
<div class="card"><span class="tag">UMAP</span><p>Uniform Manifold Approximation and Projection. Preserves as much <strong>local</strong> and <strong>more global</strong> structure than t-SNE, with a <strong>shorter runtime</strong>. Handles large and high-dimensional data, and reduces dimensions as well as visualising.</p></div>
</div>

<h3>Choosing a method</h3>
<div class="tbl-wrap"><table class="tbl">
<tr><th>Goal / situation</th><th>Method</th></tr>
<tr><td>Many missing values, constant columns, or redundant pairs</td><td>Missing value ratio / low variance / high correlation filter</td></tr>
<tr><td>Have labels, want the most predictive original features</td><td>Random forest, backward/forward selection</td></tr>
<tr><td>Linear structure, want compact uncorrelated features</td><td><strong>PCA</strong></td></tr>
<tr><td>Separate independent source signals</td><td><strong>ICA</strong></td></tr>
<tr><td>Non-linear manifold</td><td><strong>ISOMAP</strong></td></tr>
<tr><td>2-D visualisation of clusters</td><td><strong>t-SNE</strong> (small–medium data) or <strong>UMAP</strong> (large, faster)</td></tr>
</table></div>
`
        }
    ],
    notes: String.raw`
<h3>1. Unsupervised learning</h3>
<p>It finds undetected patterns in unlabelled data with minimal supervision. It answers three questions: which observations belong together (clustering), which items co-occur (association), and whether fewer variables are enough (dimensionality reduction). The pipeline is the same as supervised but without labels. Disadvantages: imprecise, lower accuracy, spectral ≠ informational classes, a human must interpret and label clusters, and class properties change over time.</p>

<h3>2. K-means</h3>
<p>High intra-cluster and low inter-cluster similarity. Produces disjoint, non-hierarchical clusters. EM algorithm: random k centroids → assign each point to the nearest centroid (E) → recompute centroids as means (M) → repeat until convergence. Limitations: k must be given; struggles with different sizes, densities and non-globular shapes; sensitive to outliers. Scale features first.</p>

<h3>3. Hierarchical</h3>
<p>Agglomerative (bottom-up; each point starts alone and the closest pair merges; "additive") vs divisive (top-down; one cluster is split repeatedly). Linkage: single, complete, average, Ward. Dendrogram: merge height = distance; cut horizontally to choose k (the number of vertical lines crossed). Wholesale-customer segmentation example.</p>

<h3>4. Association rules</h3>
<p>Itemset, support = freq(X)/N, confidence(A→B) = supp(A∪B)/supp(A), lift = conf/supp(B) (&gt;1 positive). Frequent itemset: support ≥ the threshold. High confidence can mislead when B is very common, so check lift. Algorithms: Apriori (subsets of frequent itemsets are frequent) and FP-Growth (FP-tree, no candidates).</p>

<h3>5. Dimensionality reduction</h3>
<p>p variables give p(p−1)/2 pair plots. <strong>Selection</strong>: missing value ratio, low variance, high correlation, random forest, backward elimination, forward selection. <strong>Extraction</strong>: factor analysis (correlated groups become factors); <strong>PCA</strong> (linear combinations; PC1 has the maximum variance; each later PC is uncorrelated with the earlier ones); <strong>ICA</strong> (independent rather than just uncorrelated factors); <strong>ISOMAP</strong> (non-linear manifolds); <strong>t-SNE</strong> (visualisation with probability similarities; slow, loses large-scale information); <strong>UMAP</strong> (keeps local and more global structure, faster, scales well).</p>
`,
    subjective: [
        { q: 'Define unsupervised learning and state FOUR of its disadvantages.', m: 6, a: String.raw`<p>Unsupervised learning finds previously undetected patterns in a dataset with <strong>no pre-existing labels</strong> and minimal human supervision, extracting clusters, associations and reduced representations.</p><p><strong>Disadvantages</strong>: (1) you can't get precise information about data sorting, since the output classes aren't known; (2) results are less accurate because the input isn't labelled in advance; (3) spectral classes don't always correspond to informational classes; (4) the user must spend time interpreting and labelling the classes; (5) class properties can change over time.</p>` },
        { q: 'Explain the K-means algorithm step by step, relating it to the Expectation–Maximisation framework. State THREE limitations.', m: 8, a: String.raw`<p>K-means aims for high intra-cluster similarity and low inter-cluster similarity, assigning each point to exactly one of k disjoint clusters.</p><ol><li>Choose k and randomly pick k initial centroids.</li><li><strong>Expectation step</strong>: assign every point to its nearest centroid (e.g. by Euclidean distance).</li><li><strong>Maximisation step</strong>: recompute each centroid as the mean of the points assigned to it.</li><li>Repeat steps 2–3 until convergence, when assignments no longer change.</li></ol><p><strong>Limitations</strong>: (1) the number of clusters k must be specified in advance; (2) it struggles with clusters of differing size, density and non-globular shape; (3) outliers skew the centroids and the results. (Also: it depends on the random initialisation.)</p>` },
        { q: 'Differentiate agglomerative and divisive hierarchical clustering. How is the number of clusters chosen from a dendrogram?', m: 6, a: String.raw`<p><strong>Agglomerative</strong> (bottom-up/additive): start with each of the n points as its own cluster. At each iteration, merge the two closest clusters, until one cluster remains.</p><p><strong>Divisive</strong> (top-down): start with all points in a single cluster and repeatedly split clusters until each point is separate (or a stopping criterion is met).</p><p><strong>Dendrogram</strong>: the tree records the merges, with the height of each join showing the distance at which clusters merged. Cut it with a horizontal line, and the number of vertical lines crossed is the number of clusters. A good place to cut is across the longest vertical distance without a merge.</p>` },
        { q: 'Define support, confidence and lift. Given 5 transactions T1{milk,bread}, T2{bread,diaper,beer,eggs}, T3{milk,diaper,beer,cola}, T4{bread,milk,diaper,beer}, T5{bread,milk,diaper,cola}, compute them for the rule {diaper} → {beer}.', m: 8, a: String.raw`<p><strong>Support</strong> of an itemset = the fraction of transactions containing it. <strong>Confidence</strong>(A→B) = supp(A∪B)/supp(A), the fraction of A-baskets that also contain B. <strong>Lift</strong>(A→B) = conf(A→B)/supp(B), the strength relative to independence (&gt;1 positive, =1 independent, &lt;1 negative).</p><p>supp(diaper) = 4/5 = 0.8 (T2, T3, T4, T5). supp(beer) = 3/5 = 0.6 (T2, T3, T4). supp(diaper, beer) = 3/5 = 0.6.</p><p>Confidence = 0.6/0.8 = <strong>0.75</strong>. Lift = 0.75/0.6 = <strong>1.25</strong>, so customers buying diapers are 25% more likely than average to buy beer: a positive association.</p>` },
        { q: 'Why can a rule with high confidence be misleading? Illustrate.', m: 4, a: String.raw`<p>Confidence ignores how common the consequent B already is. If B appears in most transactions, then A → B will have high confidence for almost any A, even if A has no influence on buying B.</p><p>Example: bread is in 90% of baskets. The rule {toothpaste} → {bread} may have confidence 0.9, but lift = 0.9/0.9 = 1, which means toothpaste buyers are no more likely to buy bread than anyone else. Lift corrects for B's popularity.</p>` },
        { q: 'Explain Principal Component Analysis (PCA). How does it differ from ICA?', m: 6, a: String.raw`<p>PCA extracts new variables, the principal components, from a large set of original variables. Each component is a <strong>linear combination</strong> of the original variables. The first principal component explains the <strong>maximum variance</strong> in the data. The second explains as much of the remaining variance as possible and is <strong>uncorrelated</strong> with (orthogonal to) the first, and so on. Keeping the first few components reduces dimensionality while retaining most of the information. Standardise the data first.</p><p><strong>Difference from ICA</strong>: PCA seeks <em>uncorrelated</em> components (no linear relation). ICA, based on information theory, seeks statistically <em>independent</em> components (no dependence of any kind), e.g. separating mixed source signals.</p>` },
        { q: 'Describe backward feature elimination and forward feature selection.', m: 6, a: String.raw`<p><strong>Backward elimination</strong>: train a model with all n variables and measure performance. Then train n models, each dropping one variable. Identify the variable whose removal causes the smallest (or no) drop in performance and remove it. Repeat until no variable can be dropped without hurting performance.</p><p><strong>Forward selection</strong>: train n models, each with a single variable, and keep the best-performing one. Then repeatedly add the one remaining variable that gives the largest improvement. Stop when adding variables no longer significantly improves performance.</p>` },
        { q: 'Compare t-SNE and UMAP.', m: 4, a: String.raw`<p>Both are non-linear dimensionality-reduction techniques used mainly to visualise high-dimensional data in 2-D/3-D.</p><p><strong>t-SNE</strong> computes probability-based similarities of points in the high- and low-dimensional spaces and matches them, preserving local structure well. Its limitations are loss of large-scale (global) information, slow computation, and difficulty representing very large datasets.</p><p><strong>UMAP</strong> preserves as much local and <em>more</em> global structure than t-SNE, with a shorter runtime. It handles large, high-dimensional datasets, and can be used for general dimensionality reduction as well as visualisation.</p>` }
    ],
    mcq: [
        { q: 'The key difference between supervised and unsupervised learning is:', o: ['The amount of data', 'Unsupervised learning has no pre-existing labels', 'Unsupervised learning needs rewards', 'Supervised learning cannot use numbers'], a: 1, e: 'Unsupervised learning finds structure in x alone.' },
        { q: 'Which is NOT a typical unsupervised task?', o: ['Clustering', 'Association rule mining', 'Dimensionality reduction', 'Predicting house prices from labelled sales'], a: 3, e: 'That is supervised regression.' },
        { q: 'K-means is an example of which kind of algorithm?', o: ['Reinforcement', 'Expectation–Maximisation', 'Gradient boosting', 'Bayesian'], a: 1, e: 'E-step assigns points, M-step updates centroids.' },
        { q: 'In K-means, a centroid is updated to:', o: ['The median point', 'The arithmetic mean of the points in its cluster', 'A random point', 'The farthest point'], a: 1, e: 'Centroid = average position.' },
        { q: 'Which is a limitation of K-means?', o: ['It produces a dendrogram', 'k must be specified in advance', 'It cannot use Euclidean distance', 'It needs labels'], a: 1, e: 'Also: sensitivity to outliers and non-globular shapes.' },
        { q: 'K-means performs poorly on:', o: ['Spherical clusters of similar size', 'Clusters of different densities and non-globular shapes', 'Scaled data', 'Two-dimensional data'], a: 1, e: 'It assumes roughly spherical, similar-sized clusters.' },
        { q: 'Outliers affect K-means because:', o: ['They are ignored', 'They pull the mean-based centroids away', 'They change k', 'They create new features'], a: 1, e: 'The mean is not robust.' },
        { q: 'Agglomerative hierarchical clustering starts with:', o: ['All points in one cluster', 'Each point as its own cluster', 'k random centroids', 'A decision tree'], a: 1, e: 'Bottom-up: it merges the closest clusters.' },
        { q: 'Divisive hierarchical clustering:', o: ['Merges clusters bottom-up', 'Starts with one cluster and splits it top-down', 'Requires labels', 'Is the same as K-means'], a: 1, e: 'It is the opposite of agglomerative.' },
        { q: 'In a dendrogram, the number of clusters is chosen by:', o: ['Counting leaves', 'Cutting horizontally and counting the vertical lines crossed', 'Measuring the root height', 'Choosing k randomly'], a: 1, e: 'The height of a merge shows the distance at which clusters joined.' },
        { q: 'Support of an itemset X is:', o: ['Transactions containing X / total transactions', 'supp(A∪B)/supp(A)', 'conf/supp(B)', 'The number of items in X'], a: 0, e: 'How frequently the itemset appears.' },
        { q: 'Confidence of the rule A → B is:', o: ['supp(A)/supp(B)', 'supp(A∪B)/supp(A)', 'supp(B)/supp(A∪B)', 'supp(A) × supp(B)'], a: 1, e: 'The fraction of A-transactions that also contain B.' },
        { q: 'A lift of 1 indicates:', o: ['Strong positive association', 'A and B are independent', 'Negative association', 'Confidence of 100%'], a: 1, e: 'Lift > 1 is positive and < 1 is negative.' },
        { q: '4 of 10 baskets contain {bread}, and 3 contain {bread, butter}. Confidence of bread → butter:', o: ['0.3', '0.4', '0.75', '1.33'], a: 2, e: '0.3/0.4 = 0.75.' },
        { q: 'Confidence of A → B is 0.8 and supp(B) = 0.4. Lift =', o: ['0.32', '0.5', '2.0', '1.2'], a: 2, e: '0.8/0.4 = 2: buying A doubles the likelihood of B.' },
        { q: 'The Apriori algorithm relies on the property that:', o: ['All itemsets are frequent', 'Every subset of a frequent itemset is also frequent', 'Lift is always above 1', 'Transactions are sorted'], a: 1, e: 'This lets it prune candidate itemsets.' },
        { q: 'A variable with the same value in every row should be removed by the:', o: ['High correlation filter', 'Low variance filter', 'Forward selection', 't-SNE'], a: 1, e: 'Zero variance means no information.' },
        { q: 'Two variables with correlation 0.95. The high correlation filter suggests:', o: ['Keep both', 'Drop one of them', 'Drop both', 'Multiply them'], a: 1, e: 'They carry similar information.' },
        { q: 'Backward feature elimination starts with:', o: ['No features', 'All n features and removes the least useful, one at a time', 'A random half of the features', 'PCA components'], a: 1, e: 'Forward selection starts with single features.' },
        { q: 'The first principal component:', o: ['Explains the least variance', 'Explains the maximum variance in the data', 'Is always the first original feature', 'Is correlated with PC2'], a: 1, e: 'Later PCs are uncorrelated with earlier ones.' },
        { q: 'Principal components are:', o: ['A subset of the original features', 'Linear combinations of the original variables', 'Cluster centroids', 'Association rules'], a: 1, e: 'PCA is extraction, not selection.' },
        { q: 'PCA finds ______ components, while ICA finds ______ components.', o: ['independent; uncorrelated', 'uncorrelated; independent', 'correlated; dependent', 'non-linear; linear'], a: 1, e: 'Independence is a stronger condition than being uncorrelated.' },
        { q: 'ISOMAP is most appropriate when:', o: ['Data lies on a non-linear manifold', 'Data is perfectly linear', 'There are labels', 'You need association rules'], a: 0, e: 'For example, data on a sphere or a swiss roll.' },
        { q: 'Compared with t-SNE, UMAP:', o: ['Is slower and loses global structure', 'Preserves more global structure and runs faster', 'Only works on 2-D data', 'Requires labels'], a: 1, e: 'UMAP scales well to large datasets.' },
        { q: 'With p = 100 variables, the number of pairwise scatter plots is:', o: ['100', '4,950', '10,000', '200'], a: 1, e: 'p(p − 1)/2 = 4,950 (the slide rounds this to about 5,000).' }
    ]
});
