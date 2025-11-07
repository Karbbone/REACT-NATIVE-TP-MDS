package mds.mobile.document;

import jakarta.persistence.*;
import lombok.*;
import mds.mobile.user.User;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@Table(name = "documents")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {
    @Id
    @GeneratedValue
    private UUID id; // Identifiant unique du document

    private String titre; // Titre du document
    private String description; // Description du contenu
    private String cheminFichier; // Chemin où le fichier est stocké (local ou cloud)
    private String typeFichier; // Extension ou type MIME du fichier (pdf, docx, png...)
    private long taille; // Taille du fichier en octets

    @ManyToOne
    private User proprietaire; // L'utilisateur qui a posté le document

    private LocalDateTime dateDepot; // Date de dépôt
    private LocalDateTime dateModification; // Date de dernière modification
}
