const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://ouzgaga:ouzgaga@cluster0-7foch.gcp.mongodb.net/GithubAnalytics?retryWrites=true', (err) => {
  if (err) { throw err; }
});

const commentaireArticleSchema = new mongoose.Schema({
  pseudo: String,
  contenu: String,
  date: { type: Date, default: Date.now },
});

// Création du Model pour les commentaires
const CommentaireArticleModel = mongoose.model('commentaires', commentaireArticleSchema);

// On crée une instance du Model
const monCommentaire = new CommentaireArticleModel({ pseudo: 'Atinux' });
monCommentaire.contenu = 'Salut, super article sur Mongoose !';

CommentaireArticleModel.remove({}, () => {
  console.log('collection removed');
});

// On le sauvegarde dans MongoDB !
monCommentaire.save((err) => {
  if (err) { throw err; }
  console.log('Commentaire ajouté avec succès !');
  // On se déconnecte de MongoDB maintenant
  mongoose.connection.close();
});
