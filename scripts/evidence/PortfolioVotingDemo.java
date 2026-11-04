import com.voteomatic.cryptography.core.DomainParameters;
import com.voteomatic.cryptography.core.elgamal.*;
import com.voteomatic.cryptography.core.zkp.chaumpedersen.*;
import com.voteomatic.cryptography.io.KeyStorageHandler;
import com.voteomatic.cryptography.keymanagement.*;
import com.voteomatic.cryptography.securityutils.*;
import com.voteomatic.cryptography.voting.*;
import java.lang.reflect.Proxy;
import java.math.BigInteger;
import java.util.ArrayList;

/** Executes the public library on three synthetic votes; no persistent keys. */
public class PortfolioVotingDemo {
  public static void main(String[] args) throws Exception {
    BigInteger p = new BigInteger("FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA051015728E5A8AACAA68FFFFFFFFFFFFFFFF", 16);
    BigInteger g = BigInteger.TWO;
    DomainParameters params = new DomainParameters(p, g, p.subtract(BigInteger.ONE).divide(BigInteger.TWO));
    var random = SecureRandomGeneratorImpl.createDefault();
    var hash = new SHA256HashAlgorithm();
    // Key generation uses the real KeyServiceImpl. Storage is intentionally unused.
    var unusedStorage = (KeyStorageHandler) Proxy.newProxyInstance(
        KeyStorageHandler.class.getClassLoader(), new Class<?>[]{KeyStorageHandler.class},
        (proxy, method, arguments) -> { throw new UnsupportedOperationException("No key storage in this demo"); });
    var keys = new KeyServiceImpl(params, unusedStorage, random);
    var keyPair = keys.generateKeyPair();
    var service = new VoteServiceImpl(params, new ElGamalCipherImpl(random), keys,
        new DisjunctiveChaumPedersenProver(random, hash), new DisjunctiveChaumPedersenVerifier(hash));
    var votes = new ArrayList<EncryptedVote>();
    System.out.println("Synthetic inputs: Yes, Yes, No");
    for (String choice : new String[]{"Yes", "Yes", "No"}) {
      var encrypted = service.castVote(new VoterCredentials("demo-" + (votes.size() + 1)), new Vote(choice), keyPair.getPublicKey());
      var statement = DisjunctiveChaumPedersenStatement.create(keyPair.getPublicKey(), encrypted.getVoteCiphertext(), BigInteger.ONE, g);
      boolean valid = service.verifyVote(encrypted, statement, encrypted.getValidityProof().orElseThrow());
      if (!valid) throw new IllegalStateException("A synthetic ballot failed proof verification");
      votes.add(encrypted);
      System.out.println("Ballot " + votes.size() + ": encrypted; validity proof verified = " + valid);
    }
    var tally = service.tallyVotes(votes, keyPair.getPrivateKey());
    if (!BigInteger.TWO.equals(tally)) throw new IllegalStateException("Unexpected tally: " + tally);
    System.out.println("Aggregate tally: " + tally + " Yes / " + votes.size() + " ballots");
    System.out.println("Expected tally matched = true");
  }
}
